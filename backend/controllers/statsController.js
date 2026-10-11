const Complaint = require('../models/Complaint');
const User = require('../models/User');
const filterInternalComments = require('../utils/filterInternalComments');

// @desc    Get dashboard statistics tailored by user role
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'Admin') {
      const total = await Complaint.countDocuments();
      const submitted = await Complaint.countDocuments({ status: 'Submitted' });
      const assigned = await Complaint.countDocuments({ status: 'Assigned' });
      const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
      const resolved = await Complaint.countDocuments({ status: 'Resolved' });
      const rejected = await Complaint.countDocuments({ status: 'Rejected' });

      const totalUsers = await User.countDocuments({ role: 'User' });
      const totalStaff = await User.countDocuments({ role: 'Staff' });

      const categoryStats = await Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recentComplaints = await Complaint.find()
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email department')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        stats: {
          total,
          submitted,
          assigned,
          inProgress,
          resolved,
          rejected,
          pending: submitted + assigned + inProgress,
          totalUsers,
          totalStaff,
          categoryStats,
        },
        recentComplaints,
      });
    }

    if (userRole === 'Staff') {
      const total = await Complaint.countDocuments({ assignedTo: userId });
      const assigned = await Complaint.countDocuments({ assignedTo: userId, status: 'Assigned' });
      const inProgress = await Complaint.countDocuments({ assignedTo: userId, status: 'In Progress' });
      const resolved = await Complaint.countDocuments({ assignedTo: userId, status: 'Resolved' });
      const rejected = await Complaint.countDocuments({ assignedTo: userId, status: 'Rejected' });

      const recentComplaints = await Complaint.find({ assignedTo: userId })
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        stats: {
          total,
          assigned,
          inProgress,
          resolved,
          rejected,
          pending: assigned + inProgress,
        },
        recentComplaints,
      });
    }

    // Default: User
    const total = await Complaint.countDocuments({ createdBy: userId });
    const submitted = await Complaint.countDocuments({ createdBy: userId, status: 'Submitted' });
    const assigned = await Complaint.countDocuments({ createdBy: userId, status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ createdBy: userId, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ createdBy: userId, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ createdBy: userId, status: 'Rejected' });

    const recentComplaints = await Complaint.find({ createdBy: userId })
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        submitted,
        assigned,
        inProgress,
        resolved,
        rejected,
        pending: submitted + assigned + inProgress,
      },
      recentComplaints: recentComplaints.map(filterInternalComments),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
