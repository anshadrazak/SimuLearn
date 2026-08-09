import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import labRoutes from './routes/labRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentDashboardRoutes from './routes/studentDashboard.js';
import assetRoutes from './routes/assetRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import questionBankRoutes from './routes/questionBankRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentDashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/question-banks', questionBankRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
// Serve uploads with permissive headers for video embedding and cross-origin access
app.use('/uploads', (req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms-platform');
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('DB connection error:', err.message);
    return false;
  }
};

const startServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to MongoDB. Exiting.');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
