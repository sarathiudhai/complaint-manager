import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Search, CheckSquare, RefreshCw } from 'lucide-react';

const StaffAssignedPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  // Quick action modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchAssignedComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, [search, status, priority]);

  const handleOpenActionModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status === 'Assigned' ? 'In Progress' : 'Resolved');
    setResolutionNotes(ticket.resolutionNotes || '');
    setActionModalOpen(true);
  };

  const handleUpdateTicketStatus = async () => {
    if (!selectedTicket) return;
    if ((newStatus === 'Resolved' || newStatus === 'Rejected') && !resolutionNotes.trim()) {
      setToast({ type: 'error', message: 'Resolution notes are required when marking as Resolved or Rejected' });
      return;
    }

    setUpdating(true);
    try {
      const res = await api.put(`/complaints/${selectedTicket._id}/status`, {
        status: newStatus,
        resolutionNotes,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: `Ticket ${selectedTicket.complaintId} status updated!` });
        setActionModalOpen(false);
        fetchAssignedComplaints();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Status update failed' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Complaints Queue</h1>
          <p className="page-subtitle">View and update complaints assigned to your department.</p>
        </div>
        <button onClick={fetchAssignedComplaints} className="btn btn-secondary btn-sm">
          <RefreshCw size={16} /> Refresh Queue
        </button>
      </div>

      {toast && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search ticket ID or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching assigned tickets..." />
      ) : complaints.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckSquare className="empty-state-icon" />
            <h3>No assigned complaints found</h3>
            <p style={{ marginTop: '0.4rem' }}>
              No tickets currently match your search criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((item) => (
                <tr key={item._id}>
                  <td>
                    <Link
                      to={`/complaints/${item.complaintId}`}
                      style={{ fontWeight: 700, fontFamily: 'monospace' }}
                    >
                      {item.complaintId}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: '280px' }}>{item.title}</td>
                  <td>{item.createdBy?.name || 'User'}</td>
                  <td>{item.category}</td>
                  <td>
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenActionModal(item)}
                        className="btn btn-primary btn-sm"
                      >
                        Update Status
                      </button>
                      <Link
                        to={`/complaints/${item.complaintId}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Status Update Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Update Ticket ${selectedTicket?.complaintId}`}
      >
        <div className="form-group">
          <label className="form-label">Select Target Status</label>
          <select
            className="form-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {(newStatus === 'Resolved' || newStatus === 'Rejected') && (
          <div className="form-group">
            <label className="form-label">Resolution Notes *</label>
            <textarea
              className="form-control"
              placeholder="Provide clear technical resolution notes or rejection reasons..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
              rows={4}
            />
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActionModalOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdateTicketStatus}
            disabled={updating}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StaffAssignedPage;
