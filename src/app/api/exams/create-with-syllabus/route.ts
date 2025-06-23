import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";
import { Exam, Chapter } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  let savedExam = null;
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse FormData instead of JSON
    const formData = await request.formData();
    
    const userId = formData.get('userId') as string;
    const subjectName = formData.get('subjectName') as string;
    const description = formData.get('description') as string;
    const examDate = formData.get('examDate') as string;
    const syllabusFile = formData.get('syllabusFile') as File;

    // Validate required fields
    if (!userId || !subjectName || !examDate || !syllabusFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!syllabusFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image file." },
        { status: 400 }
      );
    }

    console.log("Starting exam creation process for user:", userId);

    // STEP 1: Check if exam already exists
    const existingExam = await Exam.findOne({ userId, subjectName: subjectName.trim() });
    if (existingExam) {
      return NextResponse.json(
        { error: 'Exam already exists' },
        { status: 400 }
      );
    }

    // STEP 2: IMMEDIATELY Save the exam to database (THIS PERSISTS EVEN IF USER LEAVES)
    const examData = {
      userId,
      subjectName: subjectName.trim(),
      description: description?.trim() || "",
      examDate: new Date(examDate)
    };

    // Create and save the exam - let MongoDB generate the _id
    const newExam = new Exam(examData);
    savedExam = await newExam.save();

    console.log("Exam saved to database with ID:", savedExam._id);

    // STEP 3: Convert file to base64 data URL in backend
    let chapters = null;
    try {
      const imageDataUrl = await fileToDataUrl(syllabusFile);
      console.log("File converted to data URL, size:", imageDataUrl.length);
      
      // STEP 4: Extract chapters from syllabus image
      chapters = await extractChaptersFromImage(imageDataUrl);
      
      if (chapters && chapters.length > 0) {
        // STEP 5: Save chapters to database
        await saveChaptersToDatabase(chapters, savedExam._id);
        console.log("Chapters extracted and saved for exam:", savedExam._id);
      } else {
        console.log("Chapter extraction failed for exam:", savedExam._id);
      }
    } catch (syllabusError) {
      console.error("Error processing syllabus for exam:", savedExam._id, syllabusError);
    }

    // Return success response with exam data (regardless of syllabus processing outcome)
    return NextResponse.json({
      success: true,
      exam: savedExam.toObject(), // Convert to plain object
      chapters: chapters || [],
      message: chapters 
        ? "Exam created and syllabus processed successfully"
        : "Exam created but syllabus processing failed"
    });

  } catch (error) {
    console.error("Error in exam creation:", error);
    
    // If exam was saved but something else failed, still return the exam
    if (savedExam) {
      return NextResponse.json({
        success: true,
        exam: savedExam.toObject(),
        chapters: [],
        message: "Exam created but syllabus processing failed"
      });
    }
    
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}

// Helper function to convert File to data URL (moved to backend)
async function fileToDataUrl(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting file to data URL:", error);
    throw new Error("Failed to process the uploaded file");
  }
}

// Function to extract chapters from image using Azure OpenAI
async function extractChaptersFromImage(imageDataUrl: string) {
  try {
    console.log("Starting chapter extraction from syllabus image");
    
    // Azure OpenAI credentials and configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION || "2024-12-01-preview";
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "o4-mini";

    if (!endpoint || !apiKey) {
      throw new Error("Azure OpenAI credentials not configured");
    }

    // Initialize Azure OpenAI client
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      deployment: deploymentName,
      apiVersion,
      dangerouslyAllowBrowser: true
    });

    // Create the message payload with the system prompt and the image
    const completion = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { 
          role: "system", 
          content: "You are a specialized AI for extracting educational syllabus information from images. Extract all chapters and their subtopics from the image and format them in a structured JSON format. Each chapter should include a title and content array containing all subtopics as strings."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all chapters and subtopics from this syllabus image and return the data in JSON format with the following structure: { chapters: [{ title: string, content: string[] }] }. Make sure to include all chapters and their subtopics from the image.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_completion_tokens: 100000,
    });

    // Process the response
    const responseContent = completion.choices[0].message.content;
    console.log("Response from Azure OpenAI received");
    
    if (!responseContent) {
      throw new Error("Failed to extract content from the syllabus image");
    }

    // Extract JSON from the response
    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseContent.match(/\{[\s\S]*\}/);
    
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
    let chaptersData = JSON.parse(jsonString);
    
    // If the expected structure isn't there, check if we need to wrap it
    if (!chaptersData.chapters && Array.isArray(chaptersData)) {
      chaptersData = { chapters: chaptersData };
    }
    
    console.log("Successfully extracted", chaptersData.chapters?.length || 0, "chapters");
    return chaptersData.chapters;
  } catch (error) {
    console.error("Error extracting chapters from image:", error);
    throw error;
  }
}

// Function to save chapters to database
async function saveChaptersToDatabase(chapters: Array<{title: string, content: string[]}>, examId: string) {
  try {
    console.log("Saving", chapters.length, "chapters to database for exam:", examId);
    
    // Prepare chapters data according to the schema
    const chaptersToSave = chapters.map((chapter, index) => ({
      examId: examId,
      title: chapter.title,
      content: chapter.content,
      order: index // Add order field to maintain sequence
    }));

    // Save all chapters using insertMany for better performance
    const savedChapters = await Chapter.insertMany(chaptersToSave);
    
    console.log('All chapters saved successfully for exam:', examId);
    return savedChapters;
  } catch (error) {
    console.error('Error saving chapters:', error);
    throw error;
  }
}