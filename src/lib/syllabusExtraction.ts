import { ExamData } from "@/lib/types";
import { toast } from "sonner";

export async function extractAndSaveChaptersFromImage(file: File | null, examData: ExamData) {
  if (!file) {
    toast.error("No syllabus file provided");
    return null;
  }

  try {
    // Convert image file to base64 data URL
    const imageDataUrl = await fileToDataUrl(file);
    
    // Call the Azure OpenAI API route
    const response = await fetch('/api/syllabus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl: imageDataUrl
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || "Failed to process the syllabus image");
      return null;
    }

    const data = await response.json();
    
    if (!data.success) {
      toast.error("Failed to extract content from the syllabus image");
      return null;
    }

    // Save chapters to database
    await saveChaptersToDatabase(data.chapters, examData);
    
    toast.success("Syllabus chapters extracted and saved successfully!");
    return data.chapters;
    
  } catch (error) {
    console.error("Error in syllabus extraction:", error);
    toast.error("Failed to process the syllabus image");
    return null;
  }
}

// Helper function to convert File to data URL
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Function to save chapters to database
async function saveChaptersToDatabase(chapters: Array<{title: string, content: string[]}>, examId: ExamData) {
    console.log('Saving chapters to database:', chapters, 'for exam:', examId);
  try {
    const response = await fetch('/api/exams/chapters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        examId: examId, 
        chapters: chapters
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save chapters to database');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving chapters:', error);
    throw error;
  }
}