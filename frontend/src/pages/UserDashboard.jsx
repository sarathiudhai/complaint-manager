import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusCircle, FileText, Clock, PlayCircle, CheckCircle, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentComplaints(res.data.recentComplaints || []);
        }
      } catch (err) {
        console.error('Failed to load user dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading user dashboard metrics..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <p className="page-subtitle">Track your submitted complaints and check resolution progress.</p>
        </div>
        <Link to="/user/submit-complaint" className="btn btn-primary">
          <PlusCircle size={18} /> Submit New Complaint
        </Link>
      </div>

      {/* Stat Cards Grid */}
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
      </div>

      {/* Recent Complaints Table */}
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
          <h3 style={{ fontSize: '1.1rem' }}>My Recent Complaints</h3>
          <Link to="/user/my-complaints" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <h3>No complaints submitted yet</h3>
            <p style={{ marginTop: '0.4rem', marginBottom: '1.25rem' }}>
              Got an issue with billing, infrastructure, or tech support? Let us know.
            </p>
            <Link to="/user/submit-complaint" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Submit Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Date</th>
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
                    <td style={{ fontWeight: 600, maxWidth: '280px' }}>{item.title}</td>
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
                          {item.assignedTo.name} ({item.assignedTo.department || 'Support'})
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/complaints/${item.complaintId}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
