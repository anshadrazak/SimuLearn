import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  backgroundStory: { type: String },
  companyInfo: { type: String },
  objectives: [{ type: String }],
  requirements: [{ type: String }],
  evidenceFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  estimatedTime: { type: Number },
  maxAttempts: { type: Number, default: 3 },
  passingScore: { type: Number, default: 70 },
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

scenarioSchema.index({ course: 1, module: 1, sortOrder: 1 });

export default mongoose.model('Scenario', scenarioSchema);