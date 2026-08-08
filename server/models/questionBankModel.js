import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

questionBankSchema.index({ course: 1, module: 1 });

export default mongoose.model('QuestionBank', questionBankSchema);