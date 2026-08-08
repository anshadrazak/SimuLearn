import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completed: { type: Boolean, default: false },
  viewedAt: { type: Date, default: Date.now },
  videoProgress: { type: Number, default: 0, min: 0, max: 100 },
  watchedDuration: { type: Number, default: 0 },
}, { timestamps: true });

progressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
