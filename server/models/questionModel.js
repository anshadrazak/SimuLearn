import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionBank: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' },
  type: { type: String, enum: ['multiple_choice', 'multiple_select', 'true_false', 'code', 'essay', 'drag_drop', 'matching'], required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: mongoose.Schema.Types.Mixed,
  matchingPairs: [{ left: String, right: String }],
  codeTemplate: { type: String },
  expectedOutput: { type: String },
  language: { type: String, default: 'javascript' },
  explanation: { type: String },
  points: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  tags: [{ type: String }],
  timeLimit: { type: Number },
  sortOrder: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: true },
}, { timestamps: true });

questionSchema.index({ quiz: 1, sortOrder: 1 });
questionSchema.index({ questionBank: 1, difficulty: 1, tags: 1 });

export default mongoose.model('Question', questionSchema);