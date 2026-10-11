import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TicketCheck, Users, Zap, Clock, MessageSquare, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Zap size={15} />
          Enterprise-Grade Resolution Platform
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Streamline Complaint Resolution with{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ResolveX
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          Empower users, staff, and administrators with a unified full-stack ticket tracking system.
          Real-time status updates, intelligent staff assignment, role-based workflows, and customer feedback analytics.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          {user ? (
            <Link
              to={
                user.role === 'Admin'
                  ? '/admin/dashboard'
                  : user.role === 'Staff'
                  ? '/staff/dashboard'
                  : '/user/dashboard'
              }
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
            >
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
              >
                Demo Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '3rem',
            textAlign: 'left',
          }}
        >
          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <TicketCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Instant Ticket Creation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Submit tickets with automatic unique ID generation, priority flags, category tags, and real-time tracking.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Staff Assignment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Admins seamlessly assign staff members by department for swift investigation and resolution notes.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Feedback & Ratings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Users submit 5-star ratings and satisfaction reviews upon resolution to maintain high service standards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
