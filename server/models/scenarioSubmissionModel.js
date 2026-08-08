import mongoose from 'mongoose';

const scenarioSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  answers: mongoose.Schema.Types.Mixed,
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  content: { type: String },
  status: { type: String, enum: ['pending', 'submitted', 'reviewed', 'completed', 'returned'], default: 'pending' },
  feedback: { type: String },
  grade: { type: Number },
  attemptNumber: { type: Number, default: 1 },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

scenarioSubmissionSchema.index({ student: 1, scenario: 1 }, { unique: true });

export default mongoose.model('ScenarioSubmission', scenarioSubmissionSchema);