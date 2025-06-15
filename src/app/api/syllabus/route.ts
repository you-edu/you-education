import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Required Azure OpenAI credentials and configuration
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
    console.log("Response from Azure OpenAI:", responseContent);
    
    if (!responseContent) {
      return NextResponse.json(
        { error: "Failed to extract content from the syllabus image" },
        { status: 500 }
      );
    }

    // Extract JSON from the response
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
      let chaptersData = JSON.parse(jsonString);
      
      // If the expected structure isn't there, check if we need to wrap it
      if (!chaptersData.chapters && Array.isArray(chaptersData)) {
        chaptersData = { chapters: chaptersData };
      }
      
      return NextResponse.json({ 
        success: true, 
        chapters: chaptersData.chapters 
      });
    } catch (error) {
      console.error("Error parsing chapter data:", error);
      return NextResponse.json(
        { error: "Failed to parse the extracted chapter data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in syllabus extraction:", error);
    return NextResponse.json(
      { error: "Failed to process the syllabus image" },
      { status: 500 }
    );
  }
}