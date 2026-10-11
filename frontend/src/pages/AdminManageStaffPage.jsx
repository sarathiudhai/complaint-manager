import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCheck, UserPlus, Mail, Building } from 'lucide-react';

const AdminManageStaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Staff Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Technical Support');
  const [creating, setCreating] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/staff');
      if (res.data.success) {
        setStaffList(res.data.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
      setToast({ type: 'error', message: 'Could not load staff accounts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setToast({ type: 'error', message: 'Name, email, and password are required' });
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/auth/admin/staff', {
        name,
        email,
        password,
        department,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: 'Staff account created successfully!' });
        setCreateModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchStaffList();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Staff creation failed' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Staff Accounts</h1>
          <p className="page-subtitle">Provision support staff members and assign departmental roles.</p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
          <UserPlus size={18} /> Provision New Staff
        </button>
      </div>

      {toast && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching support staff accounts..." />
      ) : staffList.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <UserCheck className="empty-state-icon" />
            <h3>No Staff Accounts Found</h3>
            <p style={{ marginTop: '0.4rem', marginBottom: '1.25rem' }}>
              Create your first support staff account to start assigning tickets.
            </p>
            <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary btn-sm">
              <UserPlus size={16} /> Create Staff Account
            </button>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff._id}>
                  <td style={{ fontWeight: 600 }}>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {staff.department || 'General Support'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-status-assigned">Staff</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        staff.isActive ? 'badge-status-resolved' : 'badge-status-rejected'
                      }`}
                    >
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {new Date(staff.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Staff Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision Support Staff Account"
      >
        <form onSubmit={handleCreateStaff}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="staff@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="Technical Support">Technical Support</option>
              <option value="Billing & Accounts">Billing & Accounts</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Security & Access">Security & Access</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminManageStaffPage;
