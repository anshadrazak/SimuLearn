import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'admin'], required: true, default: 'student' },
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  phone: { type: String },
  address: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  refreshTokens: [{ type: String }],
}, { timestamps: true });

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addRefreshToken = function (token) {
  this.refreshTokens.push(token);
  if (this.refreshTokens.length > 5) this.refreshTokens.shift();
  return this.save();
};

userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter(t => t !== token);
  return this.save();
};

userSchema.methods.hasRefreshToken = function (token) {
  return this.refreshTokens.includes(token);
};

export default mongoose.model('User', userSchema);