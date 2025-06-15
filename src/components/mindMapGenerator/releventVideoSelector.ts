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

export async function generateMindMapWithRelevantContent(topicsWithVideos: TopicWithVideo[], chapterTitle: string = "Study Guide"): Promise<MindMapNode | null> {
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
                        "resources": {
                          "id": "res-uuid",
                          "type": "youtube_link",
                          "data": {
                            "url": "YouTube video URL"
                          }
                        }
                      },
                      {
                        "title": "Detailed Concept",
                        "is_end_node": true,
                        "resources": {
                            "id": "res-uuid",
                            "type": "notes",
                            "data": {
                               "description": "Description of notes content",
                            }
                        }
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
export function generateFallbackMindMap(topicsWithVideos: TopicWithVideo[], chapterTitle: string = "Study Guide"): MindMapNode {
  // Modify the approach to potentially create deeper hierarchies
  // Group topics by their first word to create a simple hierarchy
  const topicGroups: Record<string, TopicWithVideo[]> = {};
  
  topicsWithVideos.forEach(topic => {
    // Try to find more meaningful groupings by looking at key educational terms
    const commonEducationalTerms = [
      "introduction", "basics", "fundamentals", "advanced", "intermediate", 
      "implementation", "applications", "concepts", "principles", "theory",
      "practice", "examples", "case", "problems", "solutions"
    ];
    
    // Check if any educational term is in the title
    let category = null;
    for (const term of commonEducationalTerms) {
      if (topic.title.toLowerCase().includes(term)) {
        category = term;
        break;
      }
    }
    
    // If no educational term found, fall back to first word
    if (!category) {
      category = topic.title.split(' ')[0].toLowerCase();
    }
    
    if (!topicGroups[category]) {
      topicGroups[category] = [];
    }
    topicGroups[category].push(topic);
  });
  
  // Create mind map structure with potentially deeper nesting
  const mainNode: MindMapNode = {
    title: chapterTitle,
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
    
    // Attempt to create subcategories based on topic similarity
    const subGroups: Record<string, TopicWithVideo[]> = {};
    
    topics.forEach(topic => {
      // Extract key words (excluding common words) for grouping similar topics
      const words = topic.title.toLowerCase().split(' ')
        .filter(word => word.length > 3 && !["with", "that", "this", "from", "what", "when", "where", "which", "there", "their"].includes(word));
      
      let assigned = false;
      
      // Check if the topic fits into any existing subgroup
      for (const [subCategory, subTopics] of Object.entries(subGroups)) {
        // Check if any key word from current topic matches the subcategory
        if (words.some(word => subCategory.includes(word))) {
          subGroups[subCategory].push(topic);
          assigned = true;
          break;
        }
      }
      
      // If not assigned to any subgroup, create a new one
      if (!assigned) {
        const subCategoryKey = words.join('-');
        if (!subGroups[subCategoryKey]) {
          subGroups[subCategoryKey] = [];
        }
        subGroups[subCategoryKey].push(topic);
      }
    });
    
    // Process each subgroup
    Object.entries(subGroups).forEach(([subCategory, subTopics]) => {
      // Only create a subcategory if there are multiple topics
      if (subTopics.length > 1) {
        const subCategoryNode: MindMapNode = {
          title: subTopics[0].title.split(' ').slice(0, 3).join(' ') + " & Related",
          is_end_node: false,
          subtopics: []
        };
        
        let notesCount = 0;
        subTopics.forEach((topic, idx) => {
          // Use notes for approximately 1/3 of the topics
          const useNotes = (idx % 3 === 0) || idx === 0;
          const topicNode = createTopicNodeWithResources(topic, useNotes);
          if (useNotes) notesCount++;
          
          subCategoryNode.subtopics!.push(topicNode);
        });
        
        categoryNode.subtopics!.push(subCategoryNode);
      } else {
        // Just add the single topic directly
        const topicNode = createTopicNodeWithResources(subTopics[0], false);
        categoryNode.subtopics!.push(topicNode);
      }
    });
    
    mainNode.subtopics!.push(categoryNode);
  });
  
  return mainNode;
}

// Helper function to create a topic node with appropriate resources
function createTopicNodeWithResources(topic: TopicWithVideo, forceNotes: boolean = false): MindMapNode {
  // Select best video based on views, likes, and appropriate length
  let bestVideo = null;
  let bestScore = -1;
  
  if (!forceNotes) {
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
  }
  
  const topicNode: MindMapNode = {
    title: topic.title,
    is_end_node: true
  };
  
  // Add resource based on quality of match or forced notes
  if (bestVideo && bestScore > 0.5 && !forceNotes) {
    topicNode.resources = {
      id: `res-${uuidv4()}`,
      type: "youtube_link",
      data: {
        url: bestVideo.url
      }
    };
  } else {
    // Create notes resource
    topicNode.resources = {
      id: `res-${uuidv4()}`,
      type: "notes",
      description: `Comprehensive notes explaining ${topic.title} with key concepts, definitions, and examples.`,
      data: {
        id: `data-${uuidv4()}`
      }
    };
  }
  
  return topicNode;
}