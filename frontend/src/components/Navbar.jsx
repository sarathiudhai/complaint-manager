import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'Admin':
        return '#ef4444';
      case 'Staff':
        return '#a855f7';
      default:
        return '#3b82f6';
    }
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated && (
          <button
            onClick={toggleSidebar}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem', display: 'flex' }}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <Link
          to={
            !user
              ? '/'
              : user.role === 'Admin'
              ? '/admin/dashboard'
              : user.role === 'Staff'
              ? '/staff/dashboard'
              : '/user/dashboard'
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(90deg, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
              }}
            >
              Resolve<span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>X</span>
            </span>
          </div>
        </Link>
      </div>

      <div>
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem 0.35rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#fff',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: getRoleBadgeColor(),
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '200px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200,
                }}
                onClick={() => setDropdownOpen(false)}
              >
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '0.4rem',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                  }}
                  className="dropdown-item"
                >
                  <User size={15} /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: '0.2rem',
                  }}
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
