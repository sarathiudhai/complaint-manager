const Complaint = require('../models/Complaint');

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const prefix = `RES-${year}-`;
  
  // Find the last complaint created with matching prefix
  const lastTicket = await Complaint.findOne({
    complaintId: { $regex: `^${prefix}` },
  })
    .sort({ createdAt: -1 })
    .select('complaintId')
    .lean();

  let nextSequence = 1001;
  if (lastTicket && lastTicket.complaintId) {
    const parts = lastTicket.complaintId.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  return `${prefix}${nextSequence}`;
};

module.exports = generateTicketId;
