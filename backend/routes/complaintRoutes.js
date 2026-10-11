const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignStaff,
  updateStatus,
  updatePriorityCategory,
  addComment,
  submitFeedback,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('User'), createComplaint);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id/assign', protect, authorize('Admin'), assignStaff);
router.put('/:id/status', protect, authorize('Staff', 'Admin'), updateStatus);
router.put('/:id/priority-category', protect, authorize('Admin'), updatePriorityCategory);
router.post('/:id/comments', protect, addComment);
router.post('/:id/feedback', protect, authorize('User'), submitFeedback);

module.exports = router;
