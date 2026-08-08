import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: mongoose.Schema.Types.Mixed,
  score: { type: Number },
  totalPoints: { type: Number },
  passed: { type: Boolean },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  timeSpent: { type: Number },
  isGraded: { type: Boolean, default: false },
  manualGrade: { type: Number },
  finalGrade: { type: Number },
  requiresReview: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedback: { type: String },
  attemptNumber: { type: Number, default: 1 },
}, { timestamps: true });

quizAttemptSchema.index({ student: 1, quiz: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);