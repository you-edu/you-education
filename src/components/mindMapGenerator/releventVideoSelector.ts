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

    // Process notes resources to create database records with descriptions only
    const updatedMindMap = await processNotesForMindMap(mindMapData);

    console.log("Updated mind map after processing:", JSON.stringify(updatedMindMap, null, 2));

    toast.success("Mind map generated successfully!");
    return updatedMindMap;
    
  } catch (error) {
    console.error("Error in generating mind map:", error);
    toast.error("Failed to process the topics and videos");
    return null;
  }
}

/**
 * Process notes resources in the mind map to create database records with descriptions only
 */
async function processNotesForMindMap(mindMap: MindMapNode): Promise<MindMapNode> {
  try {
    // Create a deep clone of the mind map
    const clonedMindMap = JSON.parse(JSON.stringify(mindMap)) as MindMapNode;

    // Find all nodes that need notes creation
    const nodesToProcess = findNodesNeedingNotes(clonedMindMap);
    
    console.log(`Found ${nodesToProcess.length} nodes that need notes records`);
    console.log("Nodes to process:", nodesToProcess);
    
    if (nodesToProcess.length === 0) {
      console.log("No notes resources found to process");
      return clonedMindMap;
    }
    
    toast.info(`Creating notes placeholders for ${nodesToProcess.length} topics...`);
    
    // Process each node that needs notes sequentially to avoid race conditions
    for (const nodePath of nodesToProcess) {
      console.log("Processing node path:", nodePath);
      
      const { node, resourceIndex } = getNodeAndResourceByPath(clonedMindMap, nodePath);
      
      if (!node) {
        console.warn(`Node not found for path:`, nodePath);
        continue;
      }
      
      if (!node.resources || resourceIndex === -1 || !node.resources[resourceIndex]) {
        console.warn(`Resource not found for path:`, nodePath);
        continue;
      }
      
      const resource = node.resources[resourceIndex];
      
      if (resource.type !== 'md_notes') {
        console.warn(`Resource is not md_notes type:`, resource.type);
        continue;
      }
      
      if (!resource.data.description) {
        console.warn(`Resource has no description:`, resource);
        continue;
      }

      const description = resource.data.description;
      console.log(`Processing notes for "${node.title}" with description: "${description}"`);
      
      // Update the notes creation part with better error handling
      try {
        // Create notes record with description only (no content)
        console.log('About to create notes with data:', {
          description: description,
          content: null
        });
        
        const notesResponse = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: description,
            content: null // Explicitly set content to null
          }),
        });
        
        console.log('Notes API response status:', notesResponse.status);
        console.log('Notes API response headers:', Object.fromEntries(notesResponse.headers.entries()));
        
        if (!notesResponse.ok) {
          const errorText = await notesResponse.text();
          console.error('Notes API error response:', errorText);
          throw new Error(`Failed to create notes record: ${notesResponse.status} ${errorText}`);
        }
        
        const noteData = await notesResponse.json();
        const noteId = noteData._id;

        console.log(`Created notes record with ID: ${noteId}`);
        console.log(`Before update - resource.data:`, JSON.stringify(resource.data));

        // Update the resource with the notes ID and remove description
        resource.data.id = noteId;
        delete resource.data.description;
        
        console.log(`After update - resource.data:`, JSON.stringify(resource.data));
        console.log(`Successfully updated resource for "${node.title}" with notes ID: ${noteId}`);
        
      } catch (error) {
        console.error(`Error creating notes record for topic "${node.title}":`, error);
        // Keep the description in case of error
        console.warn(`Keeping description for "${node.title}" due to error`);
      }
    }
    
    console.log(`Successfully processed ${nodesToProcess.length} notes records`);
    
    // Verify the final state
    const finalNodesToCheck = findNodesNeedingNotes(clonedMindMap);
    console.log(`After processing, ${finalNodesToCheck.length} nodes still need processing (should be 0)`);
    
    return clonedMindMap;
    
  } catch (error) {
    console.error("Error in notes processing:", error);
    return mindMap;
  }
}

/**
 * Find all nodes in the mind map that need notes and record their paths
 */
function findNodesNeedingNotes(node: MindMapNode, currentPath: number[] = []): Array<{nodePath: number[], resourceIndex: number}> {
  let result: Array<{nodePath: number[], resourceIndex: number}> = [];
  
  // Check current node's resources
  if (node.resources && Array.isArray(node.resources)) {
    for (let i = 0; i < node.resources.length; i++) {
      const resource = node.resources[i];
      if (resource.type === 'md_notes' && resource.data && resource.data.description) {
        console.log(`Found node needing notes record:`, {
          title: node.title,
          path: currentPath,
          resourceIndex: i,
          resourceType: resource.type,
          hasDescription: !!resource.data.description,
          description: resource.data.description
        });
        result.push({ nodePath: [...currentPath], resourceIndex: i });
      }
    }
  }
  
  // Recursively check subtopics
  if (node.subtopics && node.subtopics.length > 0) {
    node.subtopics.forEach((subtopic, index) => {
      const subtopicPath = [...currentPath, index];
      result = result.concat(findNodesNeedingNotes(subtopic, subtopicPath));
    });
  }
  
  return result;
}

/**
 * Get a node and specific resource by path in the mind map
 */
function getNodeAndResourceByPath(
  root: MindMapNode, 
  path: {nodePath: number[], resourceIndex: number}
): {node: MindMapNode | null, resourceIndex: number} {
  let currentNode = root;
  
  // Navigate to the target node
  for (const index of path.nodePath) {
    if (!currentNode.subtopics || !currentNode.subtopics[index]) {
      console.error(`Invalid path, cannot access subtopic index ${index}`, {
        currentNodeTitle: currentNode.title,
        availableSubtopics: currentNode.subtopics?.length || 0,
        requestedIndex: index,
        fullPath: path.nodePath
      });
      return { node: null, resourceIndex: -1 };
    }
    currentNode = currentNode.subtopics[index];
  }
  
  console.log(`Successfully navigated to node: "${currentNode.title}" for resource index: ${path.resourceIndex}`);
  return { node: currentNode, resourceIndex: path.resourceIndex };
}
