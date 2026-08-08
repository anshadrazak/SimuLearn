import mongoose from 'mongoose';

const environmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['docker', 'vm', 'cloud', 'local'], required: true },
  status: { type: String, enum: ['provisioning', 'running', 'stopped', 'error'], default: 'provisioning' },
  config: mongoose.Schema.Types.Mixed,
  endpoint: { type: String },
  expiresAt: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab' },
}, { timestamps: true });

export default mongoose.model('Environment', environmentSchema);
