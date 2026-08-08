import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  objectives: [{ type: String }],
  scenario: { type: String },
  instructions: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  estimatedTime: { type: Number },
  maxAttempts: { type: Number, default: 3 },
  starterFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  resources: [{ type: String }],
  expectedOutput: { type: String },
  hints: [{ type: String }],
  solutionFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

labSchema.index({ course: 1, module: 1, sortOrder: 1 });

export default mongoose.model('Lab', labSchema);