import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100 },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

assignmentSchema.index({ course: 1, module: 1, sortOrder: 1 });

export default mongoose.model('Assignment', assignmentSchema);
