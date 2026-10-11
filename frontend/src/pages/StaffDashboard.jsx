import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckSquare, PlayCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentComplaints(res.data.recentComplaints || []);
        }
      } catch (err) {
        console.error('Failed to load staff dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffStats();
  }, []);

  if (loading) return <LoadingSpinner text="Loading staff workstation..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Dashboard — {user?.department || 'Support Workstation'}</h1>
          <p className="page-subtitle">Manage assigned complaint tickets and track resolution workflow.</p>
        </div>
        <Link to="/staff/assigned" className="btn btn-primary">
          <CheckSquare size={18} /> View Assigned Queue
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-accent': '#a855f7' }}>
          <div>
            <div className="stat-val">{stats?.total || 0}</div>
            <div className="stat-label">Assigned Complaints</div>
          </div>
          <div className="stat-icon-wrapper">
            <CheckSquare size={24} />
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
      </div>

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
          <h3 style={{ fontSize: '1.1rem' }}>Recently Updated Tickets</h3>
          <Link to="/staff/assigned" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View Full Queue <ArrowRight size={14} />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <CheckSquare className="empty-state-icon" />
            <h3>No complaints assigned yet</h3>
            <p style={{ marginTop: '0.4rem' }}>
              Complaints assigned to you by administrators will appear here.
            </p>
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
                    <td>{item.createdBy?.name || 'User'}</td>
                    <td>{item.category}</td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <Link
                        to={`/complaints/${item.complaintId}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Manage Ticket
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

export default StaffDashboard;
