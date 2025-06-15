import { processNotesForMindMap } from './notesAdder';

/**
 * Test function to verify notesAdder functionality
 */
export async function testNotesAdder() {
  console.log("🔍 Starting notesAdder test...");
  
  // Create a sample mind map with nodes that need notes
  const testMindMap = {
    title: "Test Subject",
    is_end_node: false,
    subtopics: [
      {
        title: "Topic 1",
        is_end_node: false,
        subtopics: [
          {
            title: "Subtopic 1.1",
            is_end_node: true,
            resources: {
              id: "res-1",
              type: "md_notes",
              description: "Create detailed notes explaining the key concepts and principles of Subtopic 1.1",
              data: {
                id: "note-1"
              }
            }
          }
        ]
      },
      {
        title: "Topic 2",
        is_end_node: true,
        resources: {
          id: "res-2",
          type: "youtube_link",
          data: {
            url: "https://www.youtube.com/watch?v=test123"
          }
        }
      },
      {
        title: "Topic 3",
        is_end_node: true,
        resources: {
          id: "res-3",
          type: "md_notes",
          description: "Generate comprehensive notes on Topic 3 with examples and diagrams",
          data: {
            id: "note-2"
          }
        }
      }
    ]
  };

  console.log("📋 Test Mind Map Structure:", JSON.stringify(testMindMap, null, 2));
  
  // Find nodes needing notes manually for verification
  let notesNodes: { path: number[]; title: any; id: any; description: any; }[] = [];
  const findNoteNodes = (node: { title: any; is_end_node?: boolean; subtopics: any; resources?: any; }, path: number[] = []) => {
    if (node.resources && node.resources.type === 'md_notes') {
      notesNodes.push({
        path,
        title: node.title,
        id: node.resources.data.id,
        description: node.resources.description
      });
    }
    
    if (node.subtopics) {
      node.subtopics.forEach((subtopic: { title: any; is_end_node?: boolean; subtopics: any; resources?: any; }, idx: any) => {
        findNoteNodes(subtopic, [...path, idx]);
      });
    }
  };
  
  findNoteNodes(testMindMap);
  console.log("🔎 Nodes that should get notes:", notesNodes);
  
  try {
    console.log("⏳ Processing notes for mind map...");
    const result = await processNotesForMindMap(testMindMap);
    
    console.log("✅ Notes generation complete!");
    console.log("📊 Result Summary:");
    console.log(`- Notes Generated: ${Object.keys(result.notesMap).length}`);
    console.log(`- Expected Notes: ${notesNodes.length}`);
    
    // Check if all expected notes were generated
    const expectedNoteIds = notesNodes.map(node => node.id);
    const generatedNoteIds = Object.keys(result.notesMap);
    
    console.log("🔍 Expected note IDs:", expectedNoteIds);
    console.log("🔍 Generated note IDs:", generatedNoteIds);
    
    const missingNotes = expectedNoteIds.filter(id => !generatedNoteIds.includes(id));
    if (missingNotes.length > 0) {
      console.error("❌ Missing notes for IDs:", missingNotes);
    } else {
      console.log("✅ All expected notes were generated");
    }
    
    // Check if descriptions were removed
    console.log("🔍 Checking if descriptions were removed...");
    
    let hasDescriptions = false;
    const checkForDescriptions = (node: { title: any; is_end_node?: boolean; subtopics?: any[]; resources?: { type?: string; description?: string; data?: any } }) => {
      if (node.resources && node.resources.description) {
        hasDescriptions = true;
        console.error("❌ Found description still present:", {
          title: node.title,
          description: node.resources.description
        });
      }
      
      if (node.subtopics) {
        node.subtopics.forEach(subtopic => checkForDescriptions(subtopic));
      }
    };
    
    checkForDescriptions(result.updatedMindMap);
    if (!hasDescriptions) {
      console.log("✅ All descriptions were properly removed");
    }
    
    // Output sample of generated notes
    console.log("\n📝 Sample of Generated Notes:");
    for (const [noteId, noteContent] of Object.entries(result.notesMap)) {
      console.log(`\n--- Note ID: ${noteId} ---`);
      // Show just the first 200 characters of each note as a preview
      console.log(noteContent.substring(0, 200) + "...");
    }
    
    console.log("\n✅ Test completed successfully");
    return result;
    
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    throw error;
  }
}

// Uncomment to run the test immediately when this file is executed
// testNotesAdder().catch(console.error);