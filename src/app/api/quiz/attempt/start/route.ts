import { NextRequest, NextResponse } from 'next/server';
import { QuizAttempt, Quiz } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { quizId, userId } = await request.json();
    
    if (!quizId || !userId) {
      return NextResponse.json(
        { error: "Quiz ID and User ID are required" },
        { status: 400 }
      );
    }

    // Validate quiz exists and belongs to user
    const quiz = await Quiz.findOne({ _id: quizId, userId });
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or access denied" },
        { status: 404 }
      );
    }

    const startedAt = new Date();

    // Check if there's already an incomplete attempt for this quiz
    const existingAttempt = await QuizAttempt.findOne({
      quizId,
      userId,
      isComplete: false
    });

    if (existingAttempt) {
      // Calculate if the existing attempt has exceeded time limit
      const timeElapsed = (startedAt.getTime() - existingAttempt.startedAt.getTime()) / 1000 / 60; // in minutes
      
      if (timeElapsed > quiz.timeLimit) {
        // Auto-submit the expired attempt
        let correctAnswers = 0;
        const processedAnswers = existingAttempt.answers.map((answer: any) => {
          const question = quiz.questions[answer.questionIndex];
          const isCorrect = question.correctAnswer === answer.selectedOption;
          if (isCorrect) correctAnswers++;
          
          return {
            questionIndex: answer.questionIndex,
            selectedOption: answer.selectedOption,
            isCorrect,
            timeTaken: answer.timeTaken || 0
          };
        });

        existingAttempt.answers = processedAnswers;
        existingAttempt.score = correctAnswers;
        existingAttempt.percentage = Math.round((correctAnswers / quiz.totalQuestions) * 100);
        existingAttempt.totalTimeTaken = quiz.timeLimit * 60;
        existingAttempt.completedAt = startedAt;
        existingAttempt.isComplete = true;

        await existingAttempt.save();
      } else {
        // Return the existing attempt if still valid
        return NextResponse.json({
          success: true,
          attempt: {
            _id: existingAttempt._id,
            startedAt: existingAttempt.startedAt,
            timeRemaining: Math.max(0, (quiz.timeLimit * 60) - (timeElapsed * 60))
          }
        });
      }
    }

    // Create new attempt
    const newAttempt = new QuizAttempt({
      quizId,
      userId,
      answers: [],
      score: 0,
      percentage: 0,
      totalTimeTaken: 0,
      completedAt: null,
      startedAt,
      isComplete: false
    });

    await newAttempt.save();

    return NextResponse.json({
      success: true,
      attempt: {
        _id: newAttempt._id,
        startedAt: newAttempt.startedAt,
        timeRemaining: quiz.timeLimit * 60 // in seconds
      }
    });

  } catch (error: any) {
    console.error('Error starting quiz attempt:', error);
    return NextResponse.json(
      { error: "Failed to start quiz attempt" },
      { status: 500 }
    );
  }
}
