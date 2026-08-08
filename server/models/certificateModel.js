import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedAt: { type: Date, default: Date.now },
  validUntil: { type: Date },
  certificateId: { type: String, required: true, unique: true },
  template: { type: String },
  downloadUrl: { type: String },
  isRevoked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);