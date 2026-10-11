import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import { Send, AlertCircle, ArrowLeft } from 'lucide-react';

const SubmitComplaintPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories || []);
          if (res.data.categories.length > 0) {
            setCategory(res.data.categories[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load complaint categories:', err);
        setToast({ type: 'error', message: 'Could not load complaint categories' });
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      setToast({ type: 'error', message: 'Please fill out all required fields' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/complaints', {
        title,
        category,
        priority,
        description,
      });

      if (res.data.success) {
        const createdTicket = res.data.complaint;
        setToast({ type: 'success', message: 'Complaint ticket created successfully!' });
        setTimeout(() => {
          navigate(`/complaints/${createdTicket.complaintId}`);
        }, 1200);
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit complaint. Try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title">Submit a New Complaint</h1>
        <p className="page-subtitle">
          Describe the issue in detail. Our support staff will investigate and resolve it promptly.
        </p>
      </div>

      {toast && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Unable to access VPN network or Billing anomaly"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={fetchingCategories}
              >
                {fetchingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level *</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="Low">Low — Minor inquiry or low impact</option>
                <option value="Medium">Medium — Normal operational problem</option>
                <option value="High">High — Major functionality affected</option>
                <option value="Urgent">Urgent — Critical system blocker</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-control"
              placeholder="Provide step-by-step details, error messages, and context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={18} />
              {loading ? 'Submitting Ticket...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaintPage;
