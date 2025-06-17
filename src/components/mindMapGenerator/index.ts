"use client"

import { youtubeVideoAdder } from './youtubeVideoAdder';
import { generateMindMapWithRelevantContent } from './releventVideoSelector';
import { processNotesForMindMap } from './notesAdder';
import { toast } from 'sonner';

interface TopicWithVideo {
  title: string;
  youtubeVideos: YoutubeVideo[];
}

interface YoutubeVideo {
  title: string;
  url: string;
  length: string;
  views: string;
  likes: string;
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

interface ProcessResult {
  updatedMindMap: MindMapNode;
}

interface GenerateMindMapResult {
  success: boolean;
  mindMapId?: string;
  error?: string;
}


export async function generateMindMapFromTopics(
  topicList: string[],
  chapterId: string,
  chapterTitle: string
): Promise<GenerateMindMapResult> {
  try {
    toast.info(`Starting mind map generation process for ${chapterTitle}...`);
    console.log(`Starting mind map generation for ${topicList.length} topics`);
    
    // Step 1: Fetch YouTube videos for each topic
    toast.info(`Fetching YouTube videos for ${topicList.length} topics...`);
    const topicsWithVideos: TopicWithVideo[] = await youtubeVideoAdder(topicList);
    console.log(`Successfully fetched videos for ${topicList.length} topics`);
    
    // Step 2: Generate mind map structure with relevant content
    toast.info("Generating mind map structure...");
    const mindMap = await generateMindMapWithRelevantContent(topicsWithVideos, chapterTitle);
    if (!mindMap) {
      throw new Error("Failed to generate mind map structure");
    }
    console.log("Mind map structure generated successfully");
    
    // Step 3: Process notes for the mind map
    toast.info("Generating notes for mind map topics...");
    const processResult: ProcessResult = await processNotesForMindMap(mindMap);
  
    

    // Step 5: Save the mind map to the database
    toast.info("Saving mind map to database...");
    const mindMapData = {
      chapterId: chapterId,
      content: processResult.updatedMindMap,
    };
    
    const mindMapResponse = await fetch('/api/mind-maps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mindMapData),
    });
    
    if (!mindMapResponse.ok) {
      throw new Error(`Failed to save mind map: ${mindMapResponse.status} ${mindMapResponse.statusText}`);
    }
    
    const mindMapResponseData = await mindMapResponse.json();
    const mindMapId = mindMapResponseData._id;
    console.log("Mind map saved successfully with ID:", mindMapId);
    
    // Step 6: Update the chapter with the mind map ID
    toast.info("Updating chapter with mind map reference...");
    const updateChapterResponse = await fetch(`/api/exams/chapters/${chapterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mindmapId: mindMapId,
      }),
    });
    
    if (!updateChapterResponse.ok) {
      throw new Error(`Failed to update chapter: ${updateChapterResponse.status} ${updateChapterResponse.statusText}`);
    }
    
    console.log("Chapter updated successfully with mind map ID");
    toast.success(`Mind map for "${chapterTitle}" generated and saved successfully!`);
    
    return {
      success: true,
      mindMapId: mindMapId,
    };
    
  } catch (error) {
    console.error("Error in mind map generation process:", error);
    toast.error(`Failed to generate mind map: ${error instanceof Error ? error.message : "Unknown error"}`);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during mind map generation",
    };
  }
}