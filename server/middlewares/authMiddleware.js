import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { verifyRefreshToken } from '../utils/generateToken.js';

export const protect = async (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Not authorized to access this route' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Not authorized - user not found' });
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized - token failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};

export const admin = (req, res, next) => authorize('admin')(req, res, next);
export const student = (req, res, next) => authorize('student')(req, res, next);

export const verifyRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not found' });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.hasRefreshToken(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token failed' });
  }
};