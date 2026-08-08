import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [{ type: String }],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);