import mongoose from 'mongoose';

const scenarioTaskSchema = new mongoose.Schema({
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  instructions: { type: String },
  type: { type: String, enum: ['file_upload', 'text', 'multiple_choice', 'url'], default: 'text' },
  options: [{ type: String }],
  correctAnswer: { type: String },
  points: { type: Number, default: 10 },
  sortOrder: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: true },
}, { timestamps: true });

scenarioTaskSchema.index({ scenario: 1, sortOrder: 1 });

export default mongoose.model('ScenarioTask', scenarioTaskSchema);