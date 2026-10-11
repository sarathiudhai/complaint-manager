const filterInternalComments = (complaint) => {
  const complaintData = complaint.toObject();
  complaintData.comments = complaintData.comments.filter((comment) => !comment.isInternal);
  return complaintData;
};

module.exports = filterInternalComments;
