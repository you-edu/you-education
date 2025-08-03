import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";
import { Quiz, Exam, Chapter } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { examId, userId, difficulty = 'medium', numberOfQuestions = 10, selectedChapterIds } = await request.json();
    
    if (!examId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: examId and userId" },
        { status: 400 }
      );
    }

    if (!selectedChapterIds || !Array.isArray(selectedChapterIds) || selectedChapterIds.length === 0) {
      return NextResponse.json(
        { error: "At least one chapter must be selected" },
        { status: 400 }
      );
    }

    // Validate exam exists and belongs to user
    const exam = await Exam.findOne({ _id: examId, userId });
    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found or access denied" },
        { status: 404 }
      );
    }

    // Get only selected chapters for this exam
    const chapters = await Chapter.find({ 
      examId, 
      _id: { $in: selectedChapterIds } 
    }).select('title content');
    
    if (!chapters || chapters.length === 0) {
      return NextResponse.json(
        { error: "No valid chapters found for the selected chapters" },
        { status: 404 }
      );
    }

    // Azure OpenAI configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION || "2024-12-01-preview";
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "o4-mini";

    if (!endpoint || !apiKey) {
      return NextResponse.json(
        { error: "Azure OpenAI credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Azure OpenAI client
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      deployment: deploymentName,
      apiVersion,
    });

    // Prepare topics for quiz generation from selected chapters only
    const allTopics = chapters.map(chapter => ({
      chapterTitle: chapter.title,
      topics: chapter.content
    }));

    // Create prompt for quiz generation
    const topicsText = allTopics.map(chapter => 
      `Chapter: ${chapter.chapterTitle}\nTopics: ${chapter.topics.join(', ')}`
    ).join('\n\n');

    const difficultyInstructions = {
      easy: "Focus on basic concepts, definitions, and simple recall questions.",
      medium: "Include application questions, scenario-based problems, and moderate analytical thinking.",
      hard: "Create complex analytical questions, critical thinking problems, and advanced application scenarios."
    };

    const completion = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        {
          role: "system",
          content: `You are an expert quiz generator for educational content. Create high-quality multiple-choice questions based on the provided topics and chapters.

IMPORTANT INSTRUCTIONS:
1. Generate exactly ${numberOfQuestions} questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Only one option should be correct
4. Include brief explanations for correct answers
5. Questions should be clear, unambiguous, and educational
6. ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}
7. Distribute questions across different chapters when possible
8. Avoid trick questions or overly technical jargon

Return the response in this EXACT JSON format:
{
  "questions": [
    {
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

CRITICAL: correctAnswer should be the index (0-3) of the correct option in the options array.`
        },
        {
          role: "user",
          content: `Generate a ${difficulty} difficulty quiz with ${numberOfQuestions} multiple-choice questions based on these selected chapters:

${topicsText}

Subject: ${exam.subjectName}
${exam.description ? `Description: ${exam.description}` : ''}

Please ensure questions cover the selected chapters and topics proportionally.`
        }
      ],
      temperature: 1,
      max_completion_tokens: 4000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse the AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseContent);
      throw new Error("Invalid response format from AI");
    }

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid questions format from AI");
    }

    // Validate and sanitize questions
    const validatedQuestions = parsedResponse.questions.map((q: any, index: number) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
        throw new Error(`Invalid question format at index ${index}`);
      }
      
      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correctAnswer index at question ${index}`);
      }

      return {
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ? q.explanation.trim() : ''
      };
    });

    // Create quiz in database
    const timeLimit = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 30; // minutes

    const selectedChapterTitles = chapters.map(ch => ch.title).join(', ');
    const quiz = new Quiz({
      examId,
      userId,
      title: `${exam.subjectName} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (${selectedChapterTitles})`,
      description: `Auto-generated ${difficulty} level quiz for selected chapters: ${selectedChapterTitles}`,
      questions: validatedQuestions,
      timeLimit,
      difficulty,
      totalQuestions: validatedQuestions.length
    });

    await quiz.save();

    return NextResponse.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        difficulty: quiz.difficulty,
        createdAt: quiz.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
