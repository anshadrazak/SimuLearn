import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  contentType: { type: String, enum: ['video', 'text', 'pdf', 'audio', 'mixed'], required: true },
  content: { type: String },
  videoUrl: { type: String },
  duration: { type: Number },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  externalLinks: [{ title: String, url: String }],
  codeBlocks: [{ language: String, code: String }],
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
}, { timestamps: true });

lessonSchema.index({ course: 1, module: 1, sortOrder: 1 });

export default mongoose.model('Lesson', lessonSchema);