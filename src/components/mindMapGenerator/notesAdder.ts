import { AzureOpenAI } from "openai";
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
  resources?: Resource;
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
    // Required Azure OpenAI credentials and configuration
    const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.NEXT_PUBLIC_OPENAI_API_VERSION || "2024-12-01-preview";
    const deploymentName = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || "o4-mini";

    if (!endpoint || !apiKey) {
      console.error("Azure OpenAI credentials not configured");
      toast.error("Azure OpenAI credentials not configured");
      return { updatedMindMap: mindMap, notesMap: {} };
    }

    console.log("Azure OpenAI credentials found");

    // Initialize Azure OpenAI client
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      deployment: deploymentName,
      apiVersion,
      dangerouslyAllowBrowser: true
    });

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
      const node = getNodeByPath(clonedMindMap, nodePath);
      if (!node || !node.resources || node.resources.type !== 'md_notes' || !node.resources.data.id) {
        console.warn(`Skipping node - missing required data`);
        continue;
      }

      const noteId = node.resources.data.id;
      let description = '';
      
      // Check if description is at the top level or in data
      if (node.resources.description) {
        description = node.resources.description;
      } else if (node.resources.data.description) {
        description = node.resources.data.description;
      }
      
      console.log(`Generating notes for "${node.title}"`);
      
      try {
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
              content: `Please generate comprehensive educational notes for the topic: "${node.title}"
              
              Additional context for note generation: "${description}"
              
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
          console.error(`Failed to generate notes for topic: ${node.title}`);
          notesMap[noteId] = `# ${node.title}\n\n*Notes generation failed. Please try again later.*`;
        } else {
          console.log(`Generated notes for "${node.title}"`);
          notesMap[noteId] = notesContent;
        }
        
        // Remove the description fields as they're no longer needed
        delete node.resources.description;
        if (node.resources.data.description) {
          delete node.resources.data.description;
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
  if (node.resources) {
    // Check if this is a notes resource that needs fixing
    if (node.resources.type === 'notes') {
      console.log(`Converting resource type from 'notes' to 'md_notes' for node: "${node.title}"`);
      node.resources.type = 'md_notes';
      
      // Ensure it has a proper ID in the data field
      if (!node.resources.data.id) {
        const newId = `note-${uuidv4()}`;
        console.log(`Creating new ID for notes resource: ${newId}`);
        node.resources.data.id = newId;
      }
      
      // If the description is in the wrong place, move it
      if (!node.resources.description && node.resources.data.description) {
        node.resources.description = node.resources.data.description;
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
 */
function findNodesNeedingNotes(node: MindMapNode, currentPath: number[] = []): number[][] {
  let result: number[][] = [];
  
  // Check if current node has a notes resource (check for both md_notes and notes for backward compatibility)
  if (node.resources && (node.resources.type === 'md_notes' || node.resources.type === 'notes') && node.resources.data.id) {
    console.log(`Found node needing notes: "${node.title}" at path [${currentPath.join(',')}]`);
    result.push([...currentPath]);
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
  if (node.resources) {
    if (node.resources.description) {
      delete node.resources.description;
    }
    if (node.resources.data.description) {
      delete node.resources.data.description;
    }
  }
  
  if (node.subtopics && node.subtopics.length > 0) {
    node.subtopics.forEach(subtopic => {
      removeAllDescriptionFields(subtopic);
    });
  }
}