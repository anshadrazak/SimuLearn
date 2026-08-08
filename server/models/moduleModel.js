import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

moduleSchema.index({ course: 1, sortOrder: 1 });

export default mongoose.model('Module', moduleSchema);
