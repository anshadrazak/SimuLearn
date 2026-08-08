import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  duration: { type: Number },
  passingScore: { type: Number, default: 70 },
  maxAttempts: { type: Number, default: 3 },
  shuffleQuestions: { type: Boolean, default: false },
  showResults: { type: Boolean, default: true },
  showAnswers: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  questionsPerAttempt: { type: Number },
  isQuestionBank: { type: Boolean, default: false },
  questionBanks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }],
  allowReview: { type: Boolean, default: true },
  certificateOnPass: { type: Boolean, default: false },
}, { timestamps: true });

quizSchema.index({ course: 1, module: 1 });

export default mongoose.model('Quiz', quizSchema);