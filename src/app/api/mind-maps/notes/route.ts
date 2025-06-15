import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Invalid input: title is required" },
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
    });

    const completion = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { 
          role: "system", 
          content: `You are a specialized AI for creating comprehensive educational notes.
          Your task is to generate clear, well-structured notes on a given topic for study purposes.
          Create notes suitable for students that include key concepts, definitions, explanations, examples, 
          and important points to remember. Format the notes with markdown.`
        },
        {
          role: "user",
          content: `Please generate comprehensive educational notes for the topic: "${title}"
          
          Additional context for note generation: "${description || ''}"
          
          The notes should:
          1. Start with a clear heading (# Topic Title)
          2. Include an introduction section
          3. Organize content with appropriate section headings (## Section Title)
          4. Use subsections where appropriate (### Subsection Title)
          5. Utilize bullet points and numbered lists for clarity
          6. Include code examples if relevant (in code blocks)
          7. Highlight important concepts or definitions with bold or italics
          8. Provide a summary or key takeaways at the end
          
          Only use Markdown formatting for structure.`
        },
      ],
      max_completion_tokens: 100000,
    });

    const notesContent = completion.choices[0].message.content;
    if (!notesContent) {
      return NextResponse.json(
        { error: "Failed to generate notes content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notesContent }, { status: 200 });
    
  } catch (error) {
    console.error("Error generating notes:", error);
    return NextResponse.json(
      { error: "Failed to generate notes" },
      { status: 500 }
    );
  }
}