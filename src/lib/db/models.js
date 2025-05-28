import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});
subjectSchema.index({ userId: 1 });

const chapterSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  content: { type: [String] },
  mindMapId: { type: mongoose.Schema.Types.ObjectId, ref: 'MindMap' },
  createdAt: { type: Date, default: Date.now }
});
chapterSchema.index({ subjectId: 1 });

const nodeDataSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

const mindMapSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});
  
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);
export const NodeData = mongoose.models.NodeData || mongoose.model('NodeData', nodeDataSchema);
export const MindMap = mongoose.models.MindMap || mongoose.model('MindMap', mindMapSchema);
