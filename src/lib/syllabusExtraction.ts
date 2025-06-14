import { ExamData } from "@/lib/types";
import { AzureOpenAI } from "openai";
import { toast } from "sonner";

export async function extractAndSaveChaptersFromImage(file: File | null, examData: ExamData) {
  if (!file) {
    toast.error("No syllabus file provided");
    return null;
  }

  try {
    // Convert image file to base64 data URL
    const imageDataUrl = await fileToDataUrl(file);
    
    // Required Azure OpenAI credentials and configuration
    const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.NEXT_PUBLIC_OPENAI_API_VERSION || "2024-12-01-preview";
    const deploymentName = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || "o4-mini";

    if (!endpoint || !apiKey) {
      toast.error("Azure OpenAI credentials not configured");
      return null;
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
      model: deploymentName,  // Keep this line - it's needed with Azure OpenAI
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
      max_completion_tokens: 3000,
    });

    // Process the response
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      toast.error("Failed to extract content from the syllabus image");
      return null;
    }

    // Extract JSON from the response
    let chaptersData;
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
      chaptersData = JSON.parse(jsonString);
      
      // If the expected structure isn't there, check if we need to wrap it
      if (!chaptersData.chapters && Array.isArray(chaptersData)) {
        chaptersData = { chapters: chaptersData };
      }
      
      // Save chapters to database
      await saveChaptersToDatabase(chaptersData.chapters, examData);
      
      toast.success("Syllabus chapters extracted and saved successfully!");
      return chaptersData.chapters;
    } catch (error) {
      console.error("Error parsing chapter data:", error);
      toast.error("Failed to parse the extracted chapter data");
      return null;
    }
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
    const response = await fetch('/api/chapters', {
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