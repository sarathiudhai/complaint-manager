import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  UserCheck,
  FolderTree,
  User,
  CheckSquare,
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getUserLinks = () => [
    { to: '/user/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/user/submit-complaint', label: 'Submit Complaint', icon: <PlusCircle size={18} /> },
    { to: '/user/my-complaints', label: 'My Complaints', icon: <FileText size={18} /> },
    { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const getStaffLinks = () => [
    { to: '/staff/dashboard', label: 'Staff Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/staff/assigned', label: 'Assigned Complaints', icon: <CheckSquare size={18} /> },
    { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const getAdminLinks = () => [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/all-complaints', label: 'All Complaints', icon: <FileText size={18} /> },
    { to: '/admin/staff', label: 'Manage Staff', icon: <UserCheck size={18} /> },
    { to: '/admin/users', label: 'Manage Users', icon: <Users size={18} /> },
    { to: '/admin/categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const navItems =
    user.role === 'Admin'
      ? getAdminLinks()
      : user.role === 'Staff'
      ? getStaffLinks()
      : getUserLinks();

  return (
    <aside
      style={{
        width: isOpen ? '240px' : '0px',
        opacity: isOpen ? 1 : 0,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        transition: 'all 0.25s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '1.25rem 1rem', flex: 1 }}>
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem',
          }}
        >
          {user.role} Portal
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              {item.icon}
              <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          textAlign: 'center',
        }}
      >
        ResolveX v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
