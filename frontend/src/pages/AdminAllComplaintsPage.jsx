import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Search, UserCheck, Settings, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminAllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Assign staff modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffIdToAssign, setStaffIdToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Priority/Category edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPriority, setEditPriority] = useState('Medium');
  const [editCategory, setEditCategory] = useState('');
  const [updatingParams, setUpdatingParams] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (category) params.append('category', category);
      params.append('page', page);
      params.append('limit', 15);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, staffRes] = await Promise.all([
          api.get('/categories'),
          api.get('/auth/admin/staff'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (staffRes.data.success) {
          setStaffList(staffRes.data.staff || []);
          if (staffRes.data.staff.length > 0) {
            setStaffIdToAssign(staffRes.data.staff[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load filters metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [search, status, priority, category, page]);

  const handleOpenAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleAssignStaff = async () => {
    if (!selectedComplaint || !staffIdToAssign) return;
    setAssigning(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint._id}/assign`, {
        staffId: staffIdToAssign,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        setAssignModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Assignment failed' });
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenEditModal = (complaint) => {
    setSelectedComplaint(complaint);
    setEditPriority(complaint.priority);
    setEditCategory(complaint.category);
    setEditModalOpen(true);
  };

  const handleSavePriorityCategory = async () => {
    if (!selectedComplaint) return;
    setUpdatingParams(true);
    try {
      const res = await api.put(`/complaints/${selectedComplaint._id}/priority-category`, {
        priority: editPriority,
        category: editCategory,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Ticket parameters updated!' });
        setEditModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdatingParams(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Complaints Registry</h1>
          <p className="page-subtitle">Search, filter, assign, and manage all user complaint tickets.</p>
        </div>
      </div>

      {toast && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by ticket ID, title, or keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-selects">
          <select
            className="form-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-select"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            className="form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching complaint records..." />
      ) : complaints.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <h3>No complaints found</h3>
            <p style={{ marginTop: '0.4rem' }}>No tickets match the selected filters.</p>
          </div>
        </div>
      ) : (
        <>
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
                  <th>Assigned Staff</th>
                  <th>Created Date</th>
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
                    <td style={{ fontWeight: 600, maxWidth: '240px' }}>{item.title}</td>
                    <td>{item.createdBy?.name || 'User'}</td>
                    <td>{item.category}</td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      {item.assignedTo ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.assignedTo.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenAssignModal(item)}
                          className="btn btn-outline btn-sm"
                          title="Assign Staff"
                        >
                          <UserCheck size={14} /> Assign
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Priority / Category"
                        >
                          <Settings size={14} /> Edit
                        </button>
                        <Link
                          to={`/complaints/${item.complaintId}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Staff Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Staff to ${selectedComplaint?.complaintId}`}
      >
        <div className="form-group">
          <label className="form-label">Select Staff Member</label>
          <select
            className="form-select"
            value={staffIdToAssign}
            onChange={(e) => setStaffIdToAssign(e.target.value)}
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

      {/* Edit Priority & Category Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Parameters for ${selectedComplaint?.complaintId}`}
      >
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSavePriorityCategory}
            disabled={updatingParams}
          >
            {updatingParams ? 'Saving...' : 'Save Parameters'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAllComplaintsPage;
