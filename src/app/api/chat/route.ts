import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";

export async function POST(request: NextRequest) {
  try {
    const { messages, context, sourceType } = await request.json();

    const contextPreview = context 
      ? `${context.substring(0, 100)}${context.length > 100 ? '...' : ''}`
      : 'No context provided';

    console.log("Chat request received:", { 
      sourceType, 
      messagesCount: messages?.length || 0,
      contextLength: context?.length || 0,
      contextPreview,
      lastUserMessage: messages?.find((msg: any) => msg.sender === "user")?.message || "No user message"
    });

    // Required Azure OpenAI credentials and configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION || "2024-12-01-preview";
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "o4-mini";

    if (!endpoint || !apiKey) {
      console.error("Missing Azure OpenAI credentials");
      return NextResponse.json(
        { error: "Azure OpenAI credentials not configured" },
        { status: 500 }
      );
    }

    console.log("Initializing Azure OpenAI client with:", { 
      endpoint: endpoint.substring(0, 20) + '...', // Log partial endpoint for security
      deploymentName,
      apiVersion 
    });

    // Initialize Azure OpenAI client
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      deployment: deploymentName,
      apiVersion,
    });

    // Extract the last question from messages
    const lastQuestion = messages.find((msg: { sender: string; }) => msg.sender === "user")?.message || "";
    
    // Extract previous messages for context
    const conversationContext = messages
      .filter((msg: any) => messages.indexOf(msg) < messages.length - 1)
      .map((msg: { sender: string; message: any; }) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.message}`)
      .join("\n");

    // Create system prompt based on source type
    let systemPrompt = "";
    if (sourceType === 'youtube') {
      systemPrompt = "You are a helpful AI assistant that answers questions based on YouTube video content. Use the provided video transcript to answer the user's question. Keep your answers short, precise, and focused on the question.";
    } else {
      systemPrompt = "You are a helpful AI assistant that answers questions based on text notes. Use the provided markdown content to answer the user's question. Keep your answers short, precise, and focused on the question.";
    }

    console.log("Sending request to Azure OpenAI with:", { 
      systemPrompt: systemPrompt.substring(0, 50) + '...',
      contentType: sourceType,
      contextLength: context?.length || 0,
      questionLength: lastQuestion.length,
      question: lastQuestion.substring(0, 50) + (lastQuestion.length > 50 ? '...' : '')
    });

    // Create the message payload
    const completion = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { 
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user",
          content: `I have the following ${sourceType === 'youtube' ? 'video transcript' : 'notes'}: \n\n${context || "No content available"}\n\nPrevious conversation:\n${conversationContext}\n\nMy question is: ${lastQuestion}`
        }
      ],
      max_completion_tokens: 1000,
    });

    const reply = completion.choices[0].message?.content || "I couldn't generate a response.";
    console.log("Received response from Azure OpenAI:", {
      replyLength: reply?.length || 0,
      replyPreview: reply?.substring(0, 50) + '...'
    });

    return NextResponse.json({ reply });
    
  } catch (error: any) {
    console.error("Error in chat API:", error);
    
    // Enhanced error reporting
    let errorDetails = "Unknown error";
    let errorType = "General Error";
    let statusCode = 500;
    
    if (error.response) {
      // Azure OpenAI API error
      errorDetails = error.response.data?.error?.message || error.message;
      errorType = "Azure OpenAI API Error";
      statusCode = error.response.status || 500;
    } else if (error.request) {
      // Network error
      errorDetails = "Network error - failed to reach the Azure OpenAI service";
      errorType = "Network Error";
    } else {
      // Other error
      errorDetails = error.message || "Unknown error occurred";
    }
    
    console.error(`${errorType}: ${errorDetails}`);
    
    return NextResponse.json(
      { 
        error: "Failed to generate response", 
        errorType,
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}