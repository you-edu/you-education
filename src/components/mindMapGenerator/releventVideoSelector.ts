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
    note?: string;
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
    
    // Call the backend API to generate mind map structure
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

    console.log("Original mind map before processing:", JSON.stringify(mindMapData, null, 2));

    // Process the mind map and create notes records for md_notes resources
    let notesCount = 0;
    const updatedMindMap = await processMindMap(mindMapData);
    
    if (notesCount > 0) {
      toast.success(`Created ${notesCount} note resources`);
    }

    console.log("Updated mind map after processing:", JSON.stringify(updatedMindMap, null, 2));
    toast.success("Mind map generated successfully!");
    
    return updatedMindMap;
    
  } catch (error) {
    console.error("Error in generating mind map:", error);
    toast.error("Failed to process the topics and videos");
    return null;
  }
  
  // Local helper function to process the mind map
  async function processMindMap(rootNode: MindMapNode): Promise<MindMapNode> {
    let notesCount = 0;
    
    // Create a deep clone of the mind map
    const clonedMindMap = JSON.parse(JSON.stringify(rootNode)) as MindMapNode;
    
    // Recursive function to traverse and process nodes
    async function traverseAndProcess(node: MindMapNode): Promise<void> {
      // Process resources in the current node
      if (node.resources && Array.isArray(node.resources)) {
        for (let i = 0; i < node.resources.length; i++) {
          const resource = node.resources[i];
          
          // Process md_notes resources by creating notes records
          if (resource.type === 'md_notes' && resource.data?.description) {
            notesCount++;
            console.log(`Processing notes for "${node.title}": "${resource.data.description.substring(0, 50)}..."`);
            
            try {
              // Create notes record with description
              const notesResponse = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  description: resource.data.description,
                  content: null // Explicitly set content to null
                }),
              });
              
              if (!notesResponse.ok) {
                const errorText = await notesResponse.text();
                console.error('Notes API error response:', errorText);
                throw new Error(`Failed to create notes record: ${notesResponse.status} ${errorText}`);
              }
              
              const noteData = await notesResponse.json();
              const noteId = noteData._id;
              
              console.log(`Created notes record with ID: ${noteId} for "${node.title}"`);
              
              // Update the resource with the notes ID and remove description
              resource.data.id = noteId;
              delete resource.data.description;
              
              console.log(`Successfully updated resource for "${node.title}" with notes ID: ${noteId}`);
            } catch (error) {
              console.error(`Error creating notes record for topic "${node.title}":`, error);
              // Keep the description in case of error
            }
          }
        }
      }
      
      // Recursively process subtopics
      if (node.subtopics && node.subtopics.length > 0) {
        for (const subtopic of node.subtopics) {
          await traverseAndProcess(subtopic);
        }
      }
    }
    
    // Start processing from the root node
    await traverseAndProcess(clonedMindMap);
    
    console.log(`Successfully processed mind map with ${notesCount} notes resources`);
    return clonedMindMap;
  }
}
