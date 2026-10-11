import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import {
  ArrowLeft,
  UserCheck,
  Send,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Star,
  Lock,
  Clock,
} from 'lucide-react';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modal & Form state for Admin/Staff actions
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status update state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Feedback state for resolved complaints (User)
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      console.error('Failed to load complaint:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to load ticket details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Fetch staff list for Admin assignment
  const handleOpenAssignModal = async () => {
    try {
      const res = await api.get('/auth/admin/staff');
      if (res.data.success) {
        setStaffList(res.data.staff || []);
        if (res.data.staff.length > 0) {
          setSelectedStaffId(res.data.staff[0]._id);
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch staff list' });
    }
    setAssignModalOpen(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) return;
    setAssigning(true);
    try {
      const res = await api.put(`/complaints/${complaint._id}/assign`, {
        staffId: selectedStaffId,
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setToast({ type: 'success', message: res.data.message });
        setAssignModalOpen(false);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Assignment failed' });
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenStatusModal = (status) => {
    setNewStatus(status);
    setResolutionNotes(complaint?.resolutionNotes || '');
    setStatusComment('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if ((newStatus === 'Resolved' || newStatus === 'Rejected') && !resolutionNotes.trim()) {
      setToast({ type: 'error', message: `Resolution notes are required when marking ticket as ${newStatus}` });
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await api.put(`/complaints/${complaint._id}/status`, {
        status: newStatus,
        resolutionNotes,
        comment: statusComment,
      });

      if (res.data.success) {
        setComplaint(res.data.complaint);
        setToast({ type: 'success', message: `Ticket status updated to ${newStatus}` });
        setStatusModalOpen(false);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Status update failed' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${complaint._id}/comments`, {
        message: commentText,
        isInternal: isInternalComment,
      });

      if (res.data.success) {
        setComplaint(res.data.complaint);
        setCommentText('');
        setIsInternalComment(false);
        setToast({ type: 'success', message: 'Comment posted successfully' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to post comment' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/complaints/${complaint._id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      });

      if (res.data.success) {
        setComplaint({
          ...complaint,
          feedback: res.data.feedback,
        });
        setToast({ type: 'success', message: 'Thank you for your feedback!' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Feedback submission failed' });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching complaint details..." />;
  if (!complaint) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Ticket Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
          The requested complaint ticket does not exist or you do not have permission to view it.
        </p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const isOwner = user && complaint.createdBy && user._id === complaint.createdBy._id;
  const isAssignedStaff =
    user && complaint.assignedTo && user._id === complaint.assignedTo._id;
  const isAdmin = user && user.role === 'Admin';
  const isStaffOrAdmin = isAdmin || user.role === 'Staff';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} /> Back to Complaints
      </button>

      {toast && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Ticket Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                }}
              >
                {complaint.complaintId}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{complaint.title}</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Submitted by <strong style={{ color: 'var(--text-main)' }}>{complaint.createdBy?.name}</strong> ({complaint.createdBy?.email}) on{' '}
              {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Action Buttons for Staff & Admin */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button onClick={handleOpenAssignModal} className="btn btn-outline btn-sm">
                <UserCheck size={16} /> Assign Staff
              </button>
            )}

            {(isAssignedStaff || isAdmin) && complaint.status !== 'Resolved' && (
              <>
                {complaint.status !== 'In Progress' && (
                  <button
                    onClick={() => handleOpenStatusModal('In Progress')}
                    className="btn btn-secondary btn-sm"
                  >
                    Start In Progress
                  </button>
                )}
                <button
                  onClick={() => handleOpenStatusModal('Resolved')}
                  className="btn btn-primary btn-sm"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleOpenStatusModal('Rejected')}
                  className="btn btn-danger btn-sm"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Category
            </div>
            <div style={{ fontWeight: 600 }}>{complaint.category}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Assigned Staff
            </div>
            <div style={{ fontWeight: 600 }}>
              {complaint.assignedTo ? (
                <span>
                  {complaint.assignedTo.name} ({complaint.assignedTo.department || 'Support'})
                </span>
              ) : (
                <span style={{ color: '#f59e0b' }}>Unassigned</span>
              )}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Last Updated
            </div>
            <div style={{ fontWeight: 600 }}>
              {new Date(complaint.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Complaint Description
          </h3>
          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '0.95rem' }}>
            {complaint.description}
          </p>
        </div>

        {/* Resolution Notes Box */}
        {complaint.resolutionNotes && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <h4
              style={{
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                marginBottom: '0.4rem',
              }}
            >
              <CheckCircle size={18} /> Official Resolution Notes
            </h4>
            <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
              {complaint.resolutionNotes}
            </p>
            {complaint.resolvedAt && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  marginTop: '0.5rem',
                }}
              >
                Resolved at: {new Date(complaint.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Feedback Section for Owner User when Resolved */}
      {complaint.status === 'Resolved' && isOwner && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Resolution Satisfaction & Feedback</h3>
          {complaint.feedback && complaint.feedback.rating ? (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                You provided the following feedback for this resolution:
              </p>
              <RatingStars rating={complaint.feedback.rating} readOnly size={22} />
              {complaint.feedback.comment && (
                <p
                  style={{
                    fontSize: '0.9rem',
                    marginTop: '0.5rem',
                    fontStyle: 'italic',
                    color: 'var(--text-main)',
                  }}
                >
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Please rate your overall experience with our support resolution:
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <RatingStars
                  rating={feedbackRating}
                  onChange={(r) => setFeedbackRating(r)}
                  size={26}
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="Share feedback on support speed and communication (optional)..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingFeedback}
              >
                <Star size={16} /> {submittingFeedback ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Activity Timeline & Comments Thread */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} /> Updates & Activity Thread
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="Write a comment or provide additional information..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isStaffOrAdmin ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                />
                <span style={{ color: isInternalComment ? '#fbbf24' : 'var(--text-muted)' }}>
                  Internal note (visible only to Staff & Admin)
                </span>
              </label>
            ) : (
              <div />
            )}

            <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment}>
              <Send size={15} /> {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Timeline list */}
        {complaint.comments.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem' }}>
            No comments yet. Start the conversation above.
          </p>
        ) : (
          <div className="timeline">
            {complaint.comments
              .filter((item) => !item.isInternal || isStaffOrAdmin)
              .map((item) => (
                <div
                  key={item._id}
                  className="timeline-item"
                  style={{
                    borderColor: item.isInternal ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)',
                  }}
                >
                  <div className="timeline-header">
                    <div>
                      <span className="timeline-author">{item.author?.name || 'System User'}</span>
                      {item.author?.role && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            marginLeft: '0.5rem',
                          }}
                        >
                          {item.author.role}
                        </span>
                      )}
                      {item.isInternal && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#fbbf24',
                            fontWeight: 700,
                            marginLeft: '0.5rem',
                          }}
                        >
                          🔒 Internal Note
                        </span>
                      )}
                    </div>
                    <span className="timeline-time">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                    {item.message}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Staff Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Staff Member"
      >
        <div className="form-group">
          <label className="form-label">Select Active Staff Member</label>
          <select
            className="form-select"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            {staffList.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.name} ({staff.department || 'General Support'}) — {staff.email}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAssignStaff} disabled={assigning}>
            {assigning ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status to: ${newStatus}`}
      >
        {(newStatus === 'Resolved' || newStatus === 'Rejected') && (
          <div className="form-group">
            <label className="form-label">Resolution Notes *</label>
            <textarea
              className="form-control"
              placeholder="Explain how the issue was fixed or why it was rejected..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
              rows={4}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Status Comment (Optional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Public status update message..."
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setStatusModalOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updatingStatus}>
            {updatingStatus ? 'Updating...' : `Set ${newStatus}`}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintDetailPage;
