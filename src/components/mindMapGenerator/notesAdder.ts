import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface Resource {
  id: string;
  type: string;
  data: {
    url?: string;
    id?: string;
    description?: string; // Some resources might have description in data
  };
}

interface MindMapNode {
  title: string;
  is_end_node: boolean;
  subtopics?: MindMapNode[];
  resources?: Resource[]; 
}

interface NotesMap {
  [dataId: string]: string;
}

interface ProcessResult {
  updatedMindMap: MindMapNode;
}

/**
 * Process a mind map to generate notes and return updated mind map and notes JSON
 */
export async function processNotesForMindMap(mindMap: MindMapNode): Promise<ProcessResult> {
  console.log("Starting notes generation process");
  try {
    // Create a deep clone of the mind map so we can modify it
    const clonedMindMap = JSON.parse(JSON.stringify(mindMap)) as MindMapNode;

    // Now find all nodes that need notes generation
    console.log("Finding nodes that need notes");
    const nodesToProcess = findNodesNeedingNotes(clonedMindMap);
    
    console.log(`Found ${nodesToProcess.length} nodes that need notes`);
    if (nodesToProcess.length === 0) {
      console.log("No nodes requiring notes were found in the mind map");
      return { updatedMindMap: clonedMindMap};
    }
    
    // Generate notes for each relevant node
    toast.info(`Generating notes for ${nodesToProcess.length} topics...`);
    
    const notesMap: NotesMap = {};
    
    // Process each node that needs notes
    for (const nodePath of nodesToProcess) {
      const { node, resourceIndex } = getNodeAndResourceByPath(clonedMindMap, nodePath);
      if (!node || !node.resources || resourceIndex === -1 || !node.resources[resourceIndex] || 
          node.resources[resourceIndex].type !== 'md_notes') {
        console.warn(`Skipping node - missing required data`);
        continue;
      }

      const resource = node.resources[resourceIndex];
      let description = resource.data.description;

      console.log(`Generating notes for "${node.title}"`);
      
      try {
        // Call the backend API endpoint for generating notes
        const response = await fetch('/api/mind-maps/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: node.title,
            description: description
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error("API error:", data.error);
          
          // Generate a fallback ID only if API request fails and we need one
          const noteId =  `note-${uuidv4()}`;
          resource.data.id = noteId;
          notesMap[noteId] = `# ${node.title}\n\n*Failed to generate notes: ${data.error}*`;
        } else {
          const notesContent = data.notes;
          
          // Save notes in DB
          const notesResponse = await fetch('/api/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: notesContent,
            }),
          });
          
          if (!notesResponse.ok) {
            throw new Error(`Failed to save notes: ${notesResponse.status} ${notesResponse.statusText}`);
          }
          
          const noteData = await notesResponse.json();
          const noteId = noteData._id;
          console.log('notes created successfully:', noteData); // remove it

          // Update the resource with the ID from the API
          resource.data.id = noteId;
          
          if (!notesContent) {
            console.error(`Failed to generate notes for topic: ${node.title}`);
            notesMap[noteId] = `# ${node.title}\n\n*Notes generation failed. Please try again later.*`;
          } else {
            console.log(`Generated notes for "${node.title}" with ID ${noteId}`);
            notesMap[noteId] = notesContent;
          }
        }

        // Clean up description field after processing
        delete resource.data.description;
        
      } catch (error) {
        console.error(`Error generating notes for topic "${node.title}":`, error);
        
        // Generate a fallback ID only in error case if needed
        const noteId = resource.data.id || `note-${uuidv4()}`;
        resource.data.id = noteId;
        notesMap[noteId] = `# ${node.title}\n\n*Error generating notes: ${error instanceof Error ? error.message : 'Unknown error'}*`;
      }
    }
    
    console.log(`Successfully generated notes for ${Object.keys(notesMap).length} topics`);
    toast.success(`Successfully generated notes for ${Object.keys(notesMap).length} topics`);
    
    return {
      updatedMindMap: clonedMindMap
    };
    
  } catch (error) {
    console.error("Error in notes generation process:", error);
    toast.error("Failed to generate notes for mind map topics");
    return { updatedMindMap: mindMap };
  }
}


/**
 * Find all nodes in the mind map that need notes and record their paths
 * Returns array of paths with [nodePath, resourceIndex]
 */
function findNodesNeedingNotes(node: MindMapNode, currentPath: number[] = []): Array<{nodePath: number[], resourceIndex: number}> {
  let result: Array<{nodePath: number[], resourceIndex: number}> = [];
  
  // Check if current node has any notes resources
  if (node.resources && Array.isArray(node.resources)) {
    for (let i = 0; i < node.resources.length; i++) {
      const resource = node.resources[i];
      if ((resource.type === 'md_notes')) {
        // We'll get the ID from API so no need to generate here
        console.log(`Found node needing notes: "${node.title}" at path [${currentPath.join(',')}], resource index ${i}`);
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
  
  for (const index of path.nodePath) {
    if (!currentNode.subtopics || !currentNode.subtopics[index]) {
      console.error(`Invalid path, cannot access index ${index} at current level`);
      return { node: null, resourceIndex: -1 };
    }
    currentNode = currentNode.subtopics[index];
  }
  
  return { node: currentNode, resourceIndex: path.resourceIndex };
}
