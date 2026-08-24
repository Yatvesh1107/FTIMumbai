import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BookOpen,
  CreditCard,
  Video,
  FileText,
  Clock,
  HelpCircle,
  Award,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user, logout, isLocked } = useAuth();
  const role = user?.role || 'admin';

  // Strict 3 Panels Architecture:
  // 1. ADMIN PANEL: Full Control
  // 2. RECEPTIONIST PANEL: Admission Desk & Fee Counter
  // 3. STUDENT PANEL: Video Classroom, Study Notes, Tasks, Live GMeet, MCQ Assessments, Certificates

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Admission Desk', path: '/admin/admissions/new', icon: UserPlus, highlight: true },
    { name: 'Students Register', path: '/admin/admissions', icon: Users },
    { name: 'Courses & Pricing Matrix', path: '/admin/courses', icon: BookOpen },
    { name: 'Batches & Cohorts', path: '/admin/batches', icon: Layers },
    { name: 'Fee & Overdue Ledger', path: '/admin/fees', icon: CreditCard },
    { name: 'LMS Videos & GMeet Studio', path: '/admin/lms', icon: Video },
    { name: 'Study Notes (PDFs)', path: '/admin/notes', icon: FileText },
    { name: 'Practical Assignments', path: '/admin/assignments', icon: Clock },
    { name: 'Question Bank & Exams', path: '/admin/exams', icon: HelpCircle },
    { name: 'Issue Certificates', path: '/admin/certificates', icon: Award },
  ];

  const receptionistLinks = [
    { name: 'Reception Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Admission Desk', path: '/admin/admissions/new', icon: UserPlus, highlight: true },
    { name: 'Students Register', path: '/admin/admissions', icon: Users },
    { name: 'Fee Counter & Receipts', path: '/admin/fees', icon: CreditCard },
  ];

  const studentLinks = [
    { name: 'My Learning Hub', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Video Classroom', path: '/student/classroom', icon: Video },
    { name: 'Study Notes & Handouts', path: '/student/notes', icon: FileText },
    { name: 'Practical Tasks', path: '/student/assignments', icon: Clock },
    { name: 'Live Classes (GMeet)', path: '/student/live-classes', icon: Sparkles },
    { name: 'Online Assessments', path: '/student/exams', icon: HelpCircle },
    { name: 'Certificates & Credentials', path: '/student/certificates', icon: Award },
    { name: 'My Fee Details', path: '/student/fees', icon: CreditCard },
  ];

  const currentLinks =
    role === 'student'
      ? studentLinks
      : role === 'receptionist'
      ? receptionistLinks
      : adminLinks;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#082c4d] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-slate-700/50 shadow-2xl`}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-700/60 px-6 bg-[#06233d]">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#12518a] to-[#0b3c68] shadow-md border border-sky-400/20">
            <span className="font-display font-black text-lg text-white tracking-wider">FTI</span>
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-white">FTI Mumbai</h1>
            <p className="text-[11px] font-medium text-sky-200">
              {role === 'admin'
                ? 'Super Admin Portal'
                : role === 'receptionist'
                ? 'Receptionist Desk'
                : 'Student Learning Portal'}
            </p>
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          ✕
        </button>
      </div>

      {/* Student Locked Warning in Sidebar */}
      {isLocked && (
        <div className="mx-4 mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-200">
          <div className="flex items-center gap-2 font-semibold text-red-400">
            <Lock className="h-4 w-4" /> Account Locked
          </div>
          <p className="mt-1 text-[11px] text-red-300/80 leading-relaxed">
            Installment payment overdue. Clear dues to restore access.
          </p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {role === 'student'
            ? 'Student Workspace'
            : role === 'receptionist'
            ? 'Front Desk & Admissions'
            : 'Institute Administration'}
        </div>

        {currentLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/admin/dashboard' &&
              item.path !== '/student/dashboard' &&
              location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#0b3c68] to-[#12518a] text-white shadow-md border border-sky-400/30'
                  : item.highlight
                  ? 'bg-[#8a6a5b]/20 text-amber-200 hover:bg-[#8a6a5b]/30 border border-[#8a6a5b]/40'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-sky-300' : item.highlight ? 'text-amber-300' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Core
                </span>
              )}
              {isActive && <ChevronRight className="h-4 w-4 text-sky-300" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="border-t border-slate-700/60 p-4 bg-[#06233d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-bold text-sky-300 border border-slate-600">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="max-w-[130px] overflow-hidden">
              <p className="truncate text-xs font-bold text-white">{user?.name || 'Authorized User'}</p>
              <p className="truncate text-[10px] capitalize text-slate-400 font-medium">
                {role === 'admin' ? 'Super Admin' : role === 'receptionist' ? 'Receptionist' : 'Student'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
