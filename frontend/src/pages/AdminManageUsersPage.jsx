import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, UserX, UserCheck, Shield } from 'lucide-react';

const AdminManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load registered users:', err);
      setToast({ type: 'error', message: 'Failed to load user accounts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (userObj) => {
    try {
      const res = await api.put(`/auth/admin/users/${userObj._id}/status`, {
        isActive: !userObj.isActive,
      });

      if (res.data.success) {
        setToast({ type: 'success', message: res.data.message });
        setUsers(
          users.map((u) => (u._id === userObj._id ? { ...u, isActive: !userObj.isActive } : u))
        );
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Status change failed' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Registered Users</h1>
          <p className="page-subtitle">View end-user accounts and control access privileges.</p>
        </div>
      </div>

      {toast && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching user roster..." />
      ) : users.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <h3>No Registered End-Users Found</h3>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Registered Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <span className="badge badge-status-submitted">{item.role}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.isActive ? 'badge-status-resolved' : 'badge-status-rejected'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleUserStatus(item)}
                      className={`btn btn-sm ${item.isActive ? 'btn-danger' : 'btn-secondary'}`}
                    >
                      {item.isActive ? (
                        <>
                          <UserX size={14} /> Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} /> Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminManageUsersPage;
