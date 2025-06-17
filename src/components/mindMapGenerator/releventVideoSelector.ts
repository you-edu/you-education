import { v4 as uuidv4 } from 'uuid';
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
  data: {
    url?: string;
    id?: string;
    description?: string;
  };
}

interface MindMapNode {
  title: string;
  is_end_node: boolean;
  subtopics?: MindMapNode[];
  resources?: Resource[];
}

export async function generateMindMapWithRelevantContent(topicsWithVideos: TopicWithVideo[], chapterTitle: string = "Study Guide"): Promise<MindMapNode | null> {
  try {
    toast.info("Generating your personalized mind map...");
    
    // Call the backend API instead of directly calling OpenAI
    const response = await fetch('/api/mind-maps/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicsWithVideos,
        chapterTitle
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("API error:", data.error);
      toast.error(data.error || "Failed to generate mind map");
      return null;
    }

    // Get the mind map from the API response
    const mindMapData = data.mindMap;
    
    if (!mindMapData) {
      toast.error("Failed to generate mind map structure");
      return null;
    }

    toast.success("Mind map with relevant content generated successfully!");
    return mindMapData;
    
  } catch (error) {
    console.error("Error in generating mind map:", error);
    toast.error("Failed to process the topics and videos");
    return null;
  }
}
