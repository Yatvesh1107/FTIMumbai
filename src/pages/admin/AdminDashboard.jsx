import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  Users,
  BookOpen,
  CreditCard,
  AlertTriangle,
  UserPlus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Lock,
  TrendingUp,
  Video
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAdmissions: 0,
    totalRevenue: 0,
    outstandingDue: 0,
    lockedStudentsCount: 0,
    activeCourses: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [admissionsRes, coursesRes, feesRes] = await Promise.all([
          apiRequest('/admissions'),
          apiRequest('/courses'),
          apiRequest('/fees')
        ]);

        if (admissionsRes.success && coursesRes.success && feesRes.success) {
          const admissions = admissionsRes.admissions || [];
          const fees = feesRes.fees || [];
          const courses = coursesRes.courses || [];

          let rev = 0;
          let due = 0;
          let locked = 0;

          fees.forEach(f => {
            rev += (f.paidAmount || 0);
            due += (f.remainingAmount || 0);
            if (f.isAppLocked) locked++;
          });

          setStats({
            totalStudents: admissions.length,
            totalAdmissions: admissions.length,
            totalRevenue: rev,
            outstandingDue: due,
            lockedStudentsCount: locked,
            activeCourses: courses.length
          });

          setRecentAdmissions(admissions.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#082c4d] via-[#0b3c68] to-[#12518a] p-8 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/10 text-sky-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Institute Analytics & Control Console
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
            FTI Operations Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-200 max-w-xl">
            Real-time insights across student admissions, fee installments, negotiation ceilings, overdue app locks, and LMS classroom activity.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/admissions/new"
            className="flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-950 shadow-lg hover:bg-amber-300 transition"
          >
            <UserPlus className="h-4 w-4" /> Admission Desk
          </Link>
          <Link
            to="/admin/fees"
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur border border-white/20 hover:bg-white/20 transition"
          >
            <CreditCard className="h-4 w-4" /> Fee Ledger
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Admissions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b3c68]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-3 font-display text-2xl font-black text-slate-900">
            {loading ? '...' : stats.totalStudents}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Across {stats.activeCourses} active courses
          </p>
        </div>

        {/* Collected Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Collected Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-3 font-display text-2xl font-black text-slate-900">
            {loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Down payments & installments
          </p>
        </div>

        {/* Outstanding Dues */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-3 font-display text-2xl font-black text-amber-700">
            {loading ? '...' : `₹${stats.outstandingDue.toLocaleString('en-IN')}`}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-amber-600">
            Scheduled upcoming installments
          </p>
        </div>

        {/* Overdue Locked Accounts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Locked Portals</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <h3 className="mt-3 font-display text-2xl font-black text-red-600">
            {loading ? '...' : stats.lockedStudentsCount}
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-red-500">
            Overdue past grace period
          </p>
        </div>
      </div>

      {/* Recent Admissions & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Admissions Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">Recent Course Admissions</h3>
              <p className="text-xs text-slate-500">Newly registered students and payment terms</p>
            </div>
            <Link
              to="/admin/admissions"
              className="text-xs font-bold text-[#0b3c68] hover:text-[#12518a] flex items-center gap-1"
            >
              View Full Register <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Course</th>
                  <th className="py-3 px-2">Agreed Fee</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No admissions recorded yet. Click 'Admission Desk' to register the first student.
                    </td>
                  </tr>
                ) : (
                  recentAdmissions.map((adm) => (
                    <tr key={adm._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-800">{adm.studentId?.fullName}</p>
                        <p className="text-[10px] text-slate-400">{adm.studentId?.enrollmentNo}</p>
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-semibold text-slate-700">{adm.courseId?.name}</p>
                        <p className="text-[10px] text-slate-400">{adm.batchTiming}</p>
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-800">₹{adm.agreedTotalFee.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-emerald-600">Paid: ₹{adm.totalPaid.toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                            adm.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adm.paymentStatus === 'partial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {adm.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations Sidebar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-slate-800">Quick Shortcuts</h3>

          <div className="space-y-2.5">
            <Link
              to="/admin/admissions/new"
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-[#0b3c68] hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-[#0b3c68]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">New Admission</h4>
                  <p className="text-[10px] text-slate-400">Discount floor validation</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0b3c68]" />
            </Link>

            <Link
              to="/admin/courses"
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-[#0b3c68] hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Course Price Ceilings</h4>
                  <p className="text-[10px] text-slate-400">Configure MRP & Floor limits</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700" />
            </Link>

            <Link
              to="/admin/lms"
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-[#0b3c68] hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Schedule Live GMeet</h4>
                  <p className="text-[10px] text-slate-400">Interactive video sessions</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
