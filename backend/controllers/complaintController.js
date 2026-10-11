const Complaint = require('../models/Complaint');
const User = require('../models/User');
const generateTicketId = require('../utils/generateTicketId');
const filterInternalComments = require('../utils/filterInternalComments');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User only)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category',
      });
    }

    const complaintId = await generateTicketId();

    const complaint = await Complaint.create({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority || 'Medium',
      status: 'Submitted',
      createdBy: req.user._id,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email department');

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of complaints (role scoped + search + filters)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // Role-based access restriction
    if (req.user.role === 'User') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'Staff') {
      // Staff defaults to assigned complaints
      query.assignedTo = req.user._id;
    }
    // Admin sees all complaints (no default restriction)

    // Filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    const visibleComplaints =
      req.user.role === 'User' ? complaints.map(filterInternalComments) : complaints;

    return res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      complaints: visibleComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details by ID or ticket ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by ObjectId or complaintId
    let query;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: id };
    } else {
      query = { complaintId: id.toUpperCase() };
    }

    const complaint = await Complaint.findOne(query)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email department')
      .populate('comments.author', 'name email role department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint ticket not found',
      });
    }

    // Ownership & permission check
    if (
      req.user.role === 'User' &&
      complaint.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own submitted complaints.',
      });
    }

    if (
      req.user.role === 'Staff' &&
      (!complaint.assignedTo ||
        complaint.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view complaints assigned to you.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint:
        req.user.role === 'User' ? filterInternalComments(complaint) : complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign staff to complaint (Admin only)
// @route   PUT /api/complaints/:id/assign
// @access  Private/Admin
const assignStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff user ID is required',
      });
    }

    const staff = await User.findOne({ _id: staffId, role: 'Staff', isActive: true });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Active staff member not found',
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.assignedTo = staff._id;
    if (complaint.status === 'Submitted') {
      complaint.status = 'Assigned';
    }

    // Add automated audit comment
    complaint.comments.push({
      author: req.user._id,
      message: `Assigned complaint to staff member: ${staff.name} (${staff.department || 'Support'})`,
      isInternal: true,
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email department')
      .populate('comments.author', 'name email role department');

    return res.status(200).json({
      success: true,
      message: `Complaint assigned to ${staff.name}`,
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution notes (Staff / Admin)
// @route   PUT /api/complaints/:id/status
// @access  Private (Staff / Admin)
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, comment } = req.body;

    const validStatuses = ['In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Staff access verification: staff must be assigned to this ticket unless Admin
    if (
      req.user.role === 'Staff' &&
      (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update complaints assigned to you',
      });
    }

    // Require resolution notes if setting to Resolved or Rejected
    if ((status === 'Resolved' || status === 'Rejected') && !resolutionNotes) {
      return res.status(400).json({
        success: false,
        message: `Resolution notes are required when marking a complaint as ${status}`,
      });
    }

    complaint.status = status;

    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes.trim();
    }

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    // Add status update comment
    const updateMsg = comment
      ? `Status changed to [${status}]. Note: ${comment.trim()}`
      : `Status updated to [${status}]`;

    complaint.comments.push({
      author: req.user._id,
      message: updateMsg,
      isInternal: false,
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email department')
      .populate('comments.author', 'name email role department');

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint priority and category (Admin only)
// @route   PUT /api/complaints/:id/priority-category
// @access  Private/Admin
const updatePriorityCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority, category } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    let changes = [];
    if (priority && ['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      if (complaint.priority !== priority) {
        changes.push(`priority from ${complaint.priority} to ${priority}`);
        complaint.priority = priority;
      }
    }

    if (category && category.trim()) {
      if (complaint.category !== category.trim()) {
        changes.push(`category from ${complaint.category} to ${category.trim()}`);
        complaint.category = category.trim();
      }
    }

    if (changes.length > 0) {
      complaint.comments.push({
        author: req.user._id,
        message: `Admin updated ticket ${changes.join(', ')}`,
        isInternal: true,
      });
      await complaint.save();
    }

    const updatedComplaint = await Complaint.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email department')
      .populate('comments.author', 'name email role department');

    return res.status(200).json({
      success: true,
      message: 'Complaint parameters updated successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private (Owner, assigned Staff, or Admin)
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, isInternal } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Access check
    if (
      req.user.role === 'User' &&
      complaint.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only comment on your own complaints',
      });
    }

    if (
      req.user.role === 'Staff' &&
      (!complaint.assignedTo ||
        complaint.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only comment on complaints assigned to you.',
      });
    }

    if (!['User', 'Staff', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to comment on this complaint.',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment message cannot be empty',
      });
    }

    complaint.comments.push({
      author: req.user._id,
      message: message.trim(),
      isInternal: req.user.role !== 'User' ? !!isInternal : false,
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email department')
      .populate('comments.author', 'name email role department');

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      complaint:
        req.user.role === 'User'
          ? filterInternalComments(updatedComplaint)
          : updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit rating and feedback after resolution
// @route   POST /api/complaints/:id/feedback
// @access  Private (Owner User only)
const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars',
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the complaint creator can submit feedback',
      });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for resolved complaints',
      });
    }

    complaint.feedback = {
      rating: parseInt(rating, 10),
      comment: comment ? comment.trim() : '',
      submittedAt: new Date(),
    };

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Thank you for submitting your feedback!',
      feedback: complaint.feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignStaff,
  updateStatus,
  updatePriorityCategory,
  addComment,
  submitFeedback,
};
