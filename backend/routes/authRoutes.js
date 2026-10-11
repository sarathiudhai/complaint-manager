const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllUsers,
  toggleUserStatus,
  createStaffAccount,
  getAllStaff,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Protected routes (Any logged-in user)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Staff & Admin accessible
router.get('/admin/staff', protect, authorize('Admin', 'Staff'), getAllStaff);

// Admin-only management routes
router.get('/admin/users', protect, authorize('Admin'), getAllUsers);
router.put('/admin/users/:id/status', protect, authorize('Admin'), toggleUserStatus);
router.post('/admin/staff', protect, authorize('Admin'), createStaffAccount);

module.exports = router;
