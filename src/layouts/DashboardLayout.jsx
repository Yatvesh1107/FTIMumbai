import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import StudentAppLockModal from '../components/StudentAppLockModal';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ allowedRoles }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, isLocked } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
          <p className="text-xs font-bold text-[#0b3c68] uppercase tracking-wider">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If student tries to access admin or vice versa, redirect appropriately
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/admin/dashboard'} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/90 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-display capitalize">
                Welcome, {user.name}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                {user.role === 'admin'
                  ? 'Institute Management & Control Center'
                  : user.role === 'receptionist'
                  ? 'Reception & Admission Desk'
                  : 'Student Learning Workspace'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="capitalize">{user.role} Mode</span>
            </div>

            <NotificationBell />

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b3c68] text-white font-bold text-xs shadow">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* If student account is locked, show non-destructive Lock Overlay */}
      {isLocked && <StudentAppLockModal />}
    </div>
  );
}
