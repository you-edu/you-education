/**
 * Mongoose models for the mindmap learning platform
 */

import mongoose from 'mongoose';

// STEP 1: Create User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// // STEP 2: Create Subject schema (belongs to User)
const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// // Index to optimize queries: find subjects by userId
subjectSchema.index({ userId: 1 });

// // STEP 3: Create Chapter schema (belongs to Subject)
const chapterSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  content: { type: [String] }, // syllabus or notes
  mindMapId: { type: mongoose.Schema.Types.ObjectId, ref: 'MindMap' },
  createdAt: { type: Date, default: Date.now }
});

// // Index for quick chapter lookup
chapterSchema.index({ subjectId: 1 });

// // STEP 4: Create MindMap schema (self-contained recursive tree)
// // One mindmap per chapter
const mindMapSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },

  root: {
    title: { type: String, required: true },
    is_end_node: { type: Boolean, required: true },
    type: { type: String }, // e.g., 'youtube_video', 'Notes'

    resource: {
      id: { type: String }, // resource ID (uuid, etc.)
      data: mongoose.Schema.Types.Mixed // allow flexible structure (e.g., { url: '', ... })
    },

    subtopics: [this] // recursive subtopic nodes
  },

  createdAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
// export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
// export const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);
// export const MindMap = mongoose.models.MindMap || mongoose.model('MindMap', mindMapSchema);
// export const Node = mongoose.models.Node || mongoose.model('Node', nodeSchema);

// Add this to avoid errors with Next.js Hot Module Replacement
// This check prevents mongoose from trying to redefine models when the file is reloaded
