import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';
import QuizAttempt from '../models/quizAttemptModel.js';
import Submission from '../models/submissionModel.js';
import ScenarioSubmission from '../models/scenarioSubmissionModel.js';
import Progress from '../models/progressModel.js';
import LabSubmission from '../models/labSubmissionModel.js';
import Environment from '../models/environmentModel.js';
import Enrollment from '../models/enrollmentModel.js';
import Certificate from '../models/certificateModel.js';
import Asset from '../models/assetModel.js';
import Course from '../models/courseModel.js';
import { generateToken, generateRefreshToken, generateTemporaryToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const role = req.body.role === 'admin' ? 'admin' : 'student';
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const verifyToken = generateTemporaryToken({ email }, '1d');
    const user = await User.create({ firstName, lastName, email, password, role, verificationToken: verifyToken });

    await sendVerificationEmail(user.email, verifyToken);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      verificationToken: verifyToken,
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Account does not exist' });
  }
  if (!(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Incorrect password' });
  }
  if (!user.isActive) {
    return res.status(401).json({ message: 'Account is deactivated' });
  }
  if (!user.isVerified) {
    return res.status(401).json({ message: 'Please verify your email before logging in' });
  }

  const accessToken = generateToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  await user.addRefreshToken(refreshToken);
  user.lastLogin = Date.now();
  await user.save();

  res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({
    _id: user._id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    token: accessToken,
    refreshToken,
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (refreshToken && req.user) {
    await req.user.removeRefreshToken(refreshToken);
  }
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Invalid verification link' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ message: 'Invalid verification token' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully', isVerified: true });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired verification link' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If the email exists, a reset link has been sent' });

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = jwt.sign({ userId: user._id, token: resetToken }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '10m' });
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendPasswordResetEmail(user.email, user.resetPasswordToken);
  res.json({ message: 'If the email exists, a reset link has been sent' });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpire: { $gt: Date.now() } }).select('+resetPasswordToken +resetPasswordExpire');
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};

export const refreshTokens = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not found' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.hasRefreshToken(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    await user.addRefreshToken(newRefreshToken);

    res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token failed' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      QuizAttempt.deleteMany({ student: userId }),
      Submission.deleteMany({ student: userId }),
      ScenarioSubmission.deleteMany({ student: userId }),
      Progress.deleteMany({ student: userId }),
      LabSubmission.deleteMany({ student: userId }),
      Environment.deleteMany({ assignedTo: userId }),
      Enrollment.deleteMany({ student: userId }),
      Certificate.deleteMany({ recipient: userId }),
    ]);

    const userAssets = await Asset.find({ uploadedBy: userId });
    for (const asset of userAssets) {
      if (asset.path) {
        const filePath = path.join(__dirname, '..', 'uploads', asset.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Failed to delete file:', err);
        });
      }
    }
    await Asset.deleteMany({ uploadedBy: userId });

    await Course.deleteMany({ createdBy: userId });

    await User.findByIdAndDelete(userId);

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.json({ message: 'Account deleted successfully. All data has been removed.' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};