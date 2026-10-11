import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileText,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  FolderTree,
  ArrowRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentComplaints(res.data.recentComplaints || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading Admin Executive Center..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Global system overview, staff management, and ticket monitoring.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/all-complaints" className="btn btn-primary">
            <FileText size={18} /> Manage All Complaints
          </Link>
          <Link to="/admin/staff" className="btn btn-secondary">
            <UserCheck size={18} /> Manage Staff
          </Link>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-accent': '#6366f1' }}>
          <div>
            <div className="stat-val">{stats?.total || 0}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-icon-wrapper">
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#3b82f6' }}>
          <div>
            <div className="stat-val">{stats?.submitted || 0}</div>
            <div className="stat-label">Submitted / Pending</div>
          </div>
          <div className="stat-icon-wrapper">
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#f59e0b' }}>
          <div>
            <div className="stat-val">{stats?.inProgress || 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-icon-wrapper">
            <PlayCircle size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#10b981' }}>
          <div>
            <div className="stat-val">{stats?.resolved || 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-icon-wrapper">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#ef4444' }}>
          <div>
            <div className="stat-val">{stats?.rejected || 0}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-icon-wrapper">
            <XCircle size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#06b6d4' }}>
          <div>
            <div className="stat-val">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Registered Users</div>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-accent': '#a855f7' }}>
          <div>
            <div className="stat-val">{stats?.totalStaff || 0}</div>
            <div className="stat-label">Active Staff</div>
          </div>
          <div className="stat-icon-wrapper">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats?.categoryStats && stats.categoryStats.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderTree size={20} /> Category Distribution
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {stats.categoryStats.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item._id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {Math.round((item.count / (stats.total || 1)) * 100)}% of overall tickets
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                  }}
                >
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.1rem' }}>Latest Submitted Tickets</h3>
          <Link to="/admin/all-complaints" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Manage All ({stats?.total || 0}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((item) => (
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
                  <td>
                    <Link
                      to={`/complaints/${item.complaintId}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Inspect Ticket
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
