import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import StaffDashboard from './pages/StaffDashboard';
import StaffAssignedPage from './pages/StaffAssignedPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAllComplaintsPage from './pages/AdminAllComplaintsPage';
import AdminManageStaffPage from './pages/AdminManageStaffPage';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import AdminManageCategoriesPage from './pages/AdminManageCategoriesPage';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <div className="main-layout">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Shared Authenticated Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* User Protected Routes */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/submit-complaint"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <SubmitComplaintPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/my-complaints"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <MyComplaintsPage />
                  </ProtectedRoute>
                }
              />

              {/* Staff Protected Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/assigned"
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffAssignedPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/all-complaints"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminAllComplaintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminManageStaffPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminManageUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminManageCategoriesPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
};

export default App;
