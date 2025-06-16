import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicsWithVideos, chapterTitle } = body;

    if (!topicsWithVideos || !Array.isArray(topicsWithVideos)) {
      return NextResponse.json(
        { error: "Invalid input: topicsWithVideos array is required" },
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

    // Prepare the topics and videos data for the AI
    const topicsData = JSON.stringify(topicsWithVideos);
    
    // Create the message payload with system prompt and topic data
    const completion = await client.chat.completions.create({
      model: deploymentName,
      messages: [
        { 
          role: "system", 
          content: `You are a specialized AI for creating educational mind maps with relevant resources.
          Your task is to analyze a list of educational topics with associated YouTube videos, select the most 
          relevant content for each topic, and organize everything into a hierarchical mind map structure.
          
          Create deep, multi-level hierarchies when appropriate for complex topics. Don't limit yourself to a 
          shallow hierarchy - create as many nested levels as needed for a comprehensive understanding of the subject.
          Your goal is to produce the most educationally valuable structure with a balanced mix of resources.`
        },
        {
          role: "user",
          content: `I have the following list of topics for the chapter "${chapterTitle}", each with several YouTube videos:
          
          ${topicsData}
          
          Please:
          1. For each topic, select the most relevant YouTube video(s) based on their titles, watch time (length), views, and likes.
             Choose videos that best explain the topic comprehensively. Select videos that have:
             - Titles that clearly match the topic
             - Reasonable length (not too short to be superficial, not too long to be impractical)
             - Higher view and like counts (suggesting better quality and popularity)
             - You may select 1 or more videos per topic if needed for complete coverage.
          
          2. Create a balanced distribution of resources - approximately 2/3 video resources and 1/3 notes resources.
             This balance helps different learning styles and ensures comprehensive coverage.
          
          3. Create notes resources for topics that:
             - Lack high-quality video matches
             - Contain complex theoretical concepts
             - Include mathematical formulas or equations
             - Require detailed step-by-step explanations
             - Are foundational to understanding other topics
             - May benefit from written explanation alongside visual learning
          
          4. Analyze the topics to identify patterns, relationships, and hierarchies. Create a DEEPLY NESTED mind map structure 
             that reflects the natural progression of learning the subject. For complex topics, create multiple levels of depth 
             as appropriate - don't limit yourself to a simple structure.
          
          5. You may:
             - Break down large topics into subtopics
             - Group related topics under conceptual categories
             - Create multiple levels of nesting when appropriate
             - Add prerequisite relationships between topics
             - Organize content from fundamental to advanced concepts
          
          6. Return a JSON mind map with the following general structure (but feel free to go deeper):
          {
            "title": "${chapterTitle}",
            "is_end_node": false,
            "subtopics": [
              {
                "title": "Topic Category",
                "is_end_node": false,
                "subtopics": [
                  {
                    "title": "Specific Area",
                    "is_end_node": false,
                    "subtopics": [
                      {
                        "title": "Detailed Concept",
                        "is_end_node": true,
                        "resources": [
                          {
                            "id": "res-uuid-1",
                            "type": "youtube_link",
                            "data": {
                              "url": "https://www.youtube.com/watch?v=video1",
                            }
                          },
                          {
                            "id": "res-uuid-2",
                            "type": "notes",
                            "data": {
                              "description": "Description of notes content."
                            }
                          }
                        ]
                      },
                      {
                        "title": "Detailed Concept",
                        "is_end_node": true,
                        "resources": [
                          {
                            "id": "res-uuid-3",
                            "type": "youtube_link",
                            "data": {
                              "url": "https://www.youtube.com/watch?v=video2",
                            }
                          },
                          {
                            "id": "res-uuid-4",
                            "type": "notes",
                            "data": {
                              "description": "Description of notes content."
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }

          IMPORTANT: 
          - Aim for approximately 1/3 of the end nodes to have notes resources and 2/3 to have video resources
          - Choose topics for notes resources strategically based on content complexity and learning needs
          - Create deep hierarchical structures to comprehensively cover the subject matter
          - The structure should serve as an in-depth study guide that helps students navigate the material in a logical progression`
        },
      ],
      max_completion_tokens: 100000,
    });

    // Process the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      return NextResponse.json(
        { error: "Failed to generate mind map with relevant content" },
        { status: 500 }
      );
    }

    // Try to find and parse JSON in the response
    try {
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
      const mindMapData = JSON.parse(jsonString);
      
      // Return the processed mind map structure
      return NextResponse.json({ mindMap: mindMapData }, { status: 200 });
    } catch (error) {
      console.error("Error parsing mind map data:", error);
      return NextResponse.json(
        { error: "Failed to parse the generated mind map data", raw: responseContent },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in generating mind map:", error);
    return NextResponse.json(
      { error: "Failed to process the topics and videos" },
      { status: 500 }
    );
  }
}