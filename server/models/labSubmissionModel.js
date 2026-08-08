import mongoose from 'mongoose';

const labSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
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

labSubmissionSchema.index({ student: 1, lab: 1 }, { unique: true });

export default mongoose.model('LabSubmission', labSubmissionSchema);