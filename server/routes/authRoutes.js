import { Router } from 'express';
import { login, register, logout, getMe, verifyEmail, forgotPassword, resetPassword, refreshTokens, deleteAccount } from '../controllers/authController.js';
import { protect, verifyRefresh } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-tokens', verifyRefresh, refreshTokens);
router.delete('/delete-account', protect, deleteAccount);

export default router;