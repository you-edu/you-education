import { AzureOpenAI } from "openai";
import { toast } from "sonner";

interface Resource {
  id: string;
  type: string;
  description?: string;
  data: {
    url?: string;
    id?: string;
    contentAvailable?: boolean;
  };
}

interface MindMapNode {
  title: string;
  is_end_node: boolean;
  subtopics?: MindMapNode[];
  resources?: Resource;
}

interface NoteContent {
  id: string;
  topicTitle: string;
  content: string;
}

/**
 * Process a mind map to generate educational notes for nodes with notes resources
 */
export async function generateNotesForMindMap(mindMap: MindMapNode): Promise<NoteContent[]> {
  try {
    // Required Azure OpenAI credentials and configuration
    const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.NEXT_PUBLIC_OPENAI_API_VERSION || "2024-12-01-preview";
    const deploymentName = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || "o4-mini";

    if (!endpoint || !apiKey) {
      toast.error("Azure OpenAI credentials not configured");
      return [];
    }

    // Initialize Azure OpenAI client
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      deployment: deploymentName,
      apiVersion,
      dangerouslyAllowBrowser: true
    });

    // Find all nodes that need notes generation
    const nodesToProcess = extractNodesWithNotesResources(mindMap);
    
    if (nodesToProcess.length === 0) {
      toast.info("No nodes requiring notes were found in the mind map");
      return [];
    }

    // Process each node to generate notes
    toast.info(`Generating notes for ${nodesToProcess.length} topics...`);
    
    const notesPromises = nodesToProcess.map(async (node) => {
      try {
        const noteId = node.resources?.data.id || '';
        const description = node.resources?.description || '';
        
        const completion = await client.chat.completions.create({
          model: deploymentName,
          messages: [
            { 
              role: "system", 
              content: `You are a specialized AI for creating comprehensive educational notes.
              Your task is to generate clear, well-structured notes on a given topic for study purposes.
              Create notes suitable for students that include key concepts, definitions, explanations, examples, 
              and important points to remember. Use markdown formatting for readability.`
            },
            {
              role: "user",
              content: `Please generate comprehensive educational notes for the topic: "${node.title}"
              
              Additional context for note generation: "${description}"
              
              The notes should:
              1. Start with a brief introduction to the topic
              2. Cover key concepts and principles
              3. Include clear definitions and explanations
              4. Provide practical examples where appropriate
              5. Highlight important points to remember
              6. Use appropriate markdown formatting with headers, lists, and emphasis
              7. Be comprehensive yet concise and focused on the specific topic
              
              Format your response as markdown content suitable for educational purposes.`
            },
          ],
          max_completion_tokens: 4000,
        });

        const notesContent = completion.choices[0].message.content;
        if (!notesContent) {
          console.error(`Failed to generate notes for topic: ${node.title}`);
          return {
            id: noteId,
            topicTitle: node.title,
            content: `# ${node.title}\n\n*Notes generation failed. Please try again later.*`
          };
        }

        return {
          id: noteId,
          topicTitle: node.title,
          content: notesContent
        };
        
      } catch (error) {
        console.error(`Error generating notes for topic "${node.title}":`, error);
        return {
          id: node.resources?.data.id || '',
          topicTitle: node.title,
          content: `# ${node.title}\n\n*Error generating notes: ${error instanceof Error ? error.message : 'Unknown error'}*`
        };
      }
    });

    const generatedNotes = await Promise.all(notesPromises);
    toast.success(`Successfully generated notes for ${generatedNotes.length} topics`);
    return generatedNotes;
    
  } catch (error) {
    console.error("Error in notes generation process:", error);
    toast.error("Failed to generate notes for mind map topics");
    return [];
  }
}

/**
 * Recursively find all nodes in the mind map that have notes resources
 */
function extractNodesWithNotesResources(node: MindMapNode): MindMapNode[] {
  let result: MindMapNode[] = [];
  
  // Check if current node has a notes resource
  if (node.resources && node.resources.type === 'md_notes') {
    result.push(node);
  }
  
  // Recursively check subtopics
  if (node.subtopics && node.subtopics.length > 0) {
    node.subtopics.forEach(subtopic => {
      result = result.concat(extractNodesWithNotesResources(subtopic));
    });
  }
  
  return result;
}

/**
 * Save generated notes to database or storage
 */
export async function saveNotesToDatabase(notes: NoteContent[]): Promise<boolean> {
  try {
    // Implementation would depend on your database/storage solution
    // For example, with a REST API:
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to save notes');
    }

    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    toast.error('Failed to save generated notes');
    return false;
  }
}

/**
 * Update the mind map with references to the generated notes
 */
export function updateMindMapWithNoteReferences(mindMap: MindMapNode, notes: NoteContent[]): MindMapNode {
  // Create a map for quick lookups of notes by ID
  const notesMap = new Map<string, NoteContent>();
  notes.forEach(note => {
    notesMap.set(note.id, note);
  });
  
  // Clone the mind map to avoid modifying the original
  const updatedMindMap = JSON.parse(JSON.stringify(mindMap)) as MindMapNode;
  
  // Recursively update the mind map
  updateNodeReferences(updatedMindMap, notesMap);
  
  return updatedMindMap;
}

/**
 * Helper function to recursively update node references
 */
function updateNodeReferences(node: MindMapNode, notesMap: Map<string, NoteContent>): void {
  // Check if current node has a notes resource
  if (node.resources && node.resources.type === 'md_notes' && node.resources.data.id) {
    const noteId = node.resources.data.id;
    const note = notesMap.get(noteId);
    
    if (note) {
      // Update the resource with a reference to the generated content
      node.resources.data = {
        ...node.resources.data,
        contentAvailable: true
      };
    }
  }
  
  // Recursively update subtopics
  if (node.subtopics && node.subtopics.length > 0) {
    node.subtopics.forEach(subtopic => {
      updateNodeReferences(subtopic, notesMap);
    });
  }
}

/**
 * Process a mind map to generate notes and update references
 */
export async function processNotesForMindMap(mindMap: MindMapNode): Promise<{
  updatedMindMap: MindMapNode,
  generatedNotes: NoteContent[]
}> {
  // Generate notes for nodes that need them
  const generatedNotes = await generateNotesForMindMap(mindMap);
  
  // Save notes to database/storage
  const saveSuccess = await saveNotesToDatabase(generatedNotes);
  
  if (!saveSuccess) {
    toast.warning('Notes generated but not saved');
  }
  
  // Update mind map with references to generated notes
  const updatedMindMap = updateMindMapWithNoteReferences(mindMap, generatedNotes);
  
  return {
    updatedMindMap,
    generatedNotes
  };
}