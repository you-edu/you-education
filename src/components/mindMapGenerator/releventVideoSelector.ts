import { v4 as uuidv4 } from 'uuid';
import { AzureOpenAI } from "openai";
import { toast } from "sonner";

interface YoutubeVideo {
  title: string;
  url: string;
  length: string;   // Duration of video in format "HH:MM:SS"
  views: string;    // Number of views, formatted (e.g., "1.2M")
  likes: string;    // Number of likes, formatted (e.g., "45K")
}

interface TopicWithVideo {
  title: string;
  youtubeVideos: YoutubeVideo[];
}

interface Resource {
  id: string;
  type: string;
  description?: string;
  data: {
    url?: string;
    id?: string;
  };
}

interface MindMapNode {
  title: string;
  is_end_node: boolean;
  subtopics?: MindMapNode[];
  resources?: Resource;
}

export async function generateMindMapWithRelevantContent(topicsWithVideos: TopicWithVideo[]): Promise<MindMapNode | null> {
  try {
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
          relevant content for each topic, and organize everything into a hierarchical mind map structure.`
        },
        {
          role: "user",
          content: `I have the following list of topics, each with several YouTube videos:
          
          ${topicsData}
          
          Please:
          1. For each topic, select the most relevant YouTube video(s) based on their titles, watch time (length), views, and likes.
             Choose videos that best explain the topic comprehensively. Select videos that have:
             - Titles that clearly match the topic
             - Reasonable length (not too short to be superficial, not too long to be impractical)
             - Higher view and like counts (suggesting better quality and popularity)
             - You may select 1 or more videos per topic if needed for complete coverage.
          
          2. If you cannot find good videos for a topic, don't include video resources but instead create a notes
             resource with a description that will guide an LLM to generate appropriate notes later.
          
          3. For topics that have good videos but require additional explanation, include both video and notes resources.
          
          4. Organize the topics into a hierarchical mind map structure. Group related topics together under
             appropriate parent nodes to create a logical study progression.
          
          5. Return a JSON mind map with the following structure:
          {
            "title": "Main Subject",
            "is_end_node": false,
            "subtopics": [
              {
                "title": "Topic Category",
                "is_end_node": false,
                "subtopics": [
                  {
                    "title": "Specific Topic",
                    "is_end_node": true,
                    "resources": {
                      "id": "res-uuid",
                      "type": "youtube_link",
                      "data": {
                        "url": "YouTube video URL"
                      }
                    }
                  },
                  {
                    "title": "Another Topic",
                    "is_end_node": true,
                    "resources": {
                      "id": "res-uuid",
                      "type": "md_notes",
                      "description": "Detailed description to guide note generation",
                      "data": {
                        "id": "data-uuid"
                      }
                    }
                  }
                ]
              }
            ]
          }
          
          Make sure every topic is covered in your mind map. Generate appropriate category names to group related topics.
          The structure should serve as a comprehensive study guide for students.`
        },
      ],
      max_completion_tokens: 4000,
    });

    // Process the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      toast.error("Failed to generate mind map with relevant content");
      return null;
    }

    // Extract JSON from the response
    let mindMapData: MindMapNode;
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
      mindMapData = JSON.parse(jsonString);
      
      // Return the processed mind map structure
      toast.success("Mind map with relevant content generated successfully!");
      return mindMapData;
      
    } catch (error) {
      console.error("Error parsing mind map data:", error);
      toast.error("Failed to parse the generated mind map data");
      return null;
    }
  } catch (error) {
    console.error("Error in generating mind map:", error);
    toast.error("Failed to process the topics and videos");
    return null;
  }
}

// Helper function to generate a fallback mind map structure without AI
export function generateFallbackMindMap(topicsWithVideos: TopicWithVideo[]): MindMapNode {
  // Group topics by their first word to create a simple hierarchy
  const topicGroups: Record<string, TopicWithVideo[]> = {};
  
  topicsWithVideos.forEach(topic => {
    const firstWord = topic.title.split(' ')[0].toLowerCase();
    if (!topicGroups[firstWord]) {
      topicGroups[firstWord] = [];
    }
    topicGroups[firstWord].push(topic);
  });
  
  // Create mind map structure
  const mainNode: MindMapNode = {
    title: "Study Guide",
    is_end_node: false,
    subtopics: []
  };
  
  // For each group, create a category node
  Object.entries(topicGroups).forEach(([category, topics]) => {
    const categoryNode: MindMapNode = {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Topics`,
      is_end_node: false,
      subtopics: []
    };
    
    // For each topic in this category, create a topic node with the best video
    topics.forEach(topic => {
      // Select best video based on views, likes, and appropriate length
      let bestVideo = null;
      let bestScore = -1;
      
      for (const video of topic.youtubeVideos) {
        // Parse views and likes to get numerical values for comparison
        const viewsNum = parseFloat(video.views.replace(/[KMB]/g, match => 
          match === 'K' ? '000' : match === 'M' ? '000000' : '000000000'));
        
        const likesNum = parseFloat(video.likes.replace(/[KMB]/g, match => 
          match === 'K' ? '000' : match === 'M' ? '000000' : '000000000'));
          
        // Parse video length
        const lengthParts = video.length.split(':');
        const lengthInSeconds = lengthParts.length === 3 
          ? parseInt(lengthParts[0]) * 3600 + parseInt(lengthParts[1]) * 60 + parseInt(lengthParts[2])
          : parseInt(lengthParts[0]) * 60 + parseInt(lengthParts[1]);
        
        // Calculate a score based on views, likes, and an ideal length around 10-15 minutes
        // Prefer videos between 5 and 20 minutes for educational content
        const lengthScore = 
          lengthInSeconds < 60 ? 0.2 :  // Too short
          lengthInSeconds < 300 ? 0.5 : // 1-5 minutes
          lengthInSeconds < 1200 ? 1.0 : // 5-20 minutes (ideal)
          lengthInSeconds < 2400 ? 0.7 : // 20-40 minutes (a bit long)
          0.4;                           // Over 40 minutes (too long)
        
        // Title match score (simple)
        const titleMatchScore = topic.title.split(' ')
          .filter(word => video.title.toLowerCase().includes(word.toLowerCase())).length / 
          topic.title.split(' ').length;
          
        // Calculate final score (weighting more on views and title match)
        const score = (
          (Math.log10(viewsNum + 1) * 0.4) + 
          (Math.log10(likesNum + 1) * 0.2) + 
          (lengthScore * 0.2) + 
          (titleMatchScore * 0.2)
        );
        
        if (score > bestScore) {
          bestScore = score;
          bestVideo = video;
        }
      }
      
      const topicNode: MindMapNode = {
        title: topic.title,
        is_end_node: true
      };
      
      // Add resource based on quality of match
      if (bestVideo && bestScore > 0.5) {
        topicNode.resources = {
          id: `res-${uuidv4()}`,
          type: "youtube_link",
          data: {
            url: bestVideo.url
          }
        };
      } else {
        // Fallback to notes if no good video match
        topicNode.resources = {
          id: `res-${uuidv4()}`,
          type: "md_notes",
          description: `Comprehensive notes explaining ${topic.title} with key concepts, definitions, and examples.`,
          data: {
            id: `data-${uuidv4()}`
          }
        };
      }
      
      categoryNode.subtopics!.push(topicNode);
    });
    
    mainNode.subtopics!.push(categoryNode);
  });
  
  return mainNode;
}