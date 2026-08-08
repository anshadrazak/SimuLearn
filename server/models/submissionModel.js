import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  content: { type: String },
  attachments: [{ type: String }],
  status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
  grade: { type: Number },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now },
  gradedAt: { type: Date },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
