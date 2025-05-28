/**
 * Example utility functions to work with the database models
 */

import { User, Subject, Chapter, MindMap, Node } from './models';
import { connectToDatabase } from './mongoose';

/**
 * Creates a new user
 */
export async function createUser(userData) {
  await connectToDatabase();
  return await User.create(userData);
}

/**
 * Creates a new subject for a user
 */
export async function createSubject(subjectData) {
  await connectToDatabase();
  return await Subject.create(subjectData);
}

/**
 * Creates a new chapter for a subject
 */
export async function createChapter(chapterData) {
  await connectToDatabase();
  return await Chapter.create(chapterData);
}

/**
 * Creates a mind map node
 */
export async function createNode(nodeData) {
  await connectToDatabase();
  return await Node.create(nodeData);
}

/**
 * Creates a new mind map with a root node for a chapter
 */
export async function createMindMap(chapterId, rootNodeData) {
  await connectToDatabase();
  
  // First create the root node
  const rootNode = await Node.create({
    title: rootNodeData.title,
    is_end_node: false,
    subtopics: []
  });
  
  // Then create the mind map with reference to the root node
  const mindMap = await MindMap.create({
    chapterId,
    root: rootNode._id
  });
  
  // Update the chapter with the mind map ID
  await Chapter.findByIdAndUpdate(chapterId, { mindMapId: mindMap._id });
  
  return { mindMap, rootNode };
}

/**
 * Adds a subtopic to a node in the mind map
 */
export async function addSubtopicToNode(parentNodeId, subtopicData) {
  await connectToDatabase();
  
  // Create the new node
  const newNode = await Node.create({
    title: subtopicData.title,
    is_end_node: subtopicData.is_end_node || false,
    type: subtopicData.type,
    resource: subtopicData.resource,
    subtopics: []
  });
  
  // Update the parent node to include this new subtopic
  await Node.findByIdAndUpdate(
    parentNodeId,
    { $push: { subtopics: newNode._id } }
  );
  
  return newNode;
}

/**
 * Gets a user's subjects with their chapters and mind maps
 */
export async function getUserSubjectsWithChapters(userId) {
  await connectToDatabase();
  
  const subjects = await Subject.find({ userId })
    .lean();
  
  // For each subject, get its chapters
  for (const subject of subjects) {
    subject.chapters = await Chapter.find({ subjectId: subject._id })
      .sort({ order: 1 })
      .lean();
    
    // For each chapter, get its mind map
    for (const chapter of subject.chapters) {
      if (chapter.mindMapId) {
        const mindMap = await MindMap.findById(chapter.mindMapId).lean();
        chapter.mindMap = mindMap;
        
        // Get the root node and populate its subtopics recursively
        if (mindMap && mindMap.root) {
          chapter.mindMap.rootNode = await populateNodeWithSubtopics(mindMap.root);
        }
      }
    }
  }
  
  return subjects;
}

/**
 * Helper function to recursively populate a node and its subtopics
 */
async function populateNodeWithSubtopics(nodeId) {
  const node = await Node.findById(nodeId).lean();
  
  if (node && node.subtopics && node.subtopics.length > 0) {
    node.populatedSubtopics = [];
    
    for (const subtopicId of node.subtopics) {
      const subtopic = await populateNodeWithSubtopics(subtopicId);
      node.populatedSubtopics.push(subtopic);
    }
  }
  
  return node;
}
