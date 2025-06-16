import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface Resource {
  id: string;
  type: string;
  description?: string;
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
  resources?: Resource[]; // Changed from single Resource to Resource[]
}

interface NotesMap {
  [dataId: string]: string;
}

interface ProcessResult {
  updatedMindMap: MindMapNode;
  notesMap: NotesMap;
}

/**
 * Process a mind map to generate notes and return updated mind map and notes JSON
 */
export async function processNotesForMindMap(mindMap: MindMapNode): Promise<ProcessResult> {
  console.log("Starting notes generation process");
  try {
    // Create a deep clone of the mind map so we can modify it
    const clonedMindMap = JSON.parse(JSON.stringify(mindMap)) as MindMapNode;
    
    // First, scan and fix any resources of type "notes" to "md_notes" and ensure they have a proper ID
    console.log("Scanning and fixing notes resources");
    fixNotesResources(clonedMindMap);

    // Now find all nodes that need notes generation
    console.log("Finding nodes that need notes");
    const nodesToProcess = findNodesNeedingNotes(clonedMindMap);
    
    console.log(`Found ${nodesToProcess.length} nodes that need notes`);
    if (nodesToProcess.length === 0) {
      console.log("No nodes requiring notes were found in the mind map");
      return { updatedMindMap: clonedMindMap, notesMap: {} };
    }
    
    // Generate notes for each relevant node
    toast.info(`Generating notes for ${nodesToProcess.length} topics...`);
    
    const notesMap: NotesMap = {};
    
    // Process each node that needs notes
    for (const nodePath of nodesToProcess) {
      const { node, resourceIndex } = getNodeAndResourceByPath(clonedMindMap, nodePath);
      if (!node || !node.resources || resourceIndex === -1 || !node.resources[resourceIndex] || 
          node.resources[resourceIndex].type !== 'md_notes' || !node.resources[resourceIndex].data.id) {
        console.warn(`Skipping node - missing required data`);
        continue;
      }

      const resource = node.resources[resourceIndex];
      const noteId = resource.data.id;
      if (!noteId) {
        console.warn(`Resource is missing a note ID for node "${node.title}"`);
        continue;
      }
      let description = '';
      
      // Check if description is at the top level or in data
      if (resource.description) {
        description = resource.description;
      } else if (resource.data.description) {
        description = resource.data.description;
      }
      
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
          notesMap[noteId] = `# ${node.title}\n\n*Failed to generate notes: ${data.error}*`;
        } else {
          const notesContent = data.notes;
          if (!notesContent) {
            console.error(`Failed to generate notes for topic: ${node.title}`);
            notesMap[noteId] = `# ${node.title}\n\n*Notes generation failed. Please try again later.*`;
          } else {
            console.log(`Generated notes for "${node.title}"`);
            notesMap[noteId] = notesContent;
          }
        }
        
        // Remove the description fields as they're no longer needed
        delete resource.description;
        if (resource.data.description) {
          delete resource.data.description;
        }
        
      } catch (error) {
        console.error(`Error generating notes for topic "${node.title}":`, error);
        notesMap[noteId] = `# ${node.title}\n\n*Error generating notes: ${error instanceof Error ? error.message : 'Unknown error'}*`;
      }
    }

    // Clean up all description fields in the mind map
    removeAllDescriptionFields(clonedMindMap);
    
    console.log(`Successfully generated notes for ${Object.keys(notesMap).length} topics`);
    toast.success(`Successfully generated notes for ${Object.keys(notesMap).length} topics`);
    
    return {
      updatedMindMap: clonedMindMap,
      notesMap: notesMap
    };
    
  } catch (error) {
    console.error("Error in notes generation process:", error);
    toast.error("Failed to generate notes for mind map topics");
    return { updatedMindMap: mindMap, notesMap: {} };
  }
}

/**
 * Fix resources that should be notes - convert type and ensure proper ID structure
 */
function fixNotesResources(node: MindMapNode): void {
  if (node.resources && Array.isArray(node.resources)) {
    // Process each resource in the array
    for (let i = 0; i < node.resources.length; i++) {
      const resource = node.resources[i];
      
      // Check if this is a notes resource that needs fixing
      if (resource.type === 'notes') {
        console.log(`Converting resource type from 'notes' to 'md_notes' for node: "${node.title}"`);
        resource.type = 'md_notes';
        
        // Ensure it has a proper ID in the data field
        if (!resource.data.id) {
          const newId = `note-${uuidv4()}`;
          console.log(`Creating new ID for notes resource: ${newId}`);
          resource.data.id = newId;
        }
        
        // If the description is in the wrong place, move it
        if (!resource.description && resource.data.description) {
          resource.description = resource.data.description;
        }
      }
    }
  }
  
  // Recursively process subtopics
  if (node.subtopics && node.subtopics.length > 0) {
    node.subtopics.forEach(subtopic => {
      fixNotesResources(subtopic);
    });
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
      if ((resource.type === 'md_notes' || resource.type === 'notes')) {
        // If there's no ID, create one
        if (!resource.data.id) {
          resource.data.id = `note-${uuidv4()}`;
        }
        
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

/**
 * Get a node by its path in the mind map
 */
function getNodeByPath(root: MindMapNode, path: number[]): MindMapNode | null {
  let currentNode = root;
  
  for (const index of path) {
    if (!currentNode.subtopics || !currentNode.subtopics[index]) {
      console.error(`Invalid path, cannot access index ${index} at current level`);
      return null;
    }
    currentNode = currentNode.subtopics[index];
  }
  
  return currentNode;
}

/**
 * Remove all description fields from resources in the mind map
 */
function removeAllDescriptionFields(node: MindMapNode): void {
  if (node.resources && Array.isArray(node.resources)) {
    for (const resource of node.resources) {
      if (resource.description) {
        delete resource.description;
      }
      if (resource.data.description) {
        delete resource.data.description;
      }
    }
  }
  
  if (node.subtopics && node.subtopics.length > 0) {
    node.subtopics.forEach(subtopic => {
      removeAllDescriptionFields(subtopic);
    });
  }
}