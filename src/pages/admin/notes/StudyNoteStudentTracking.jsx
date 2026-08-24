import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  Users,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search
} from 'lucide-react';

export default function StudyNoteStudentTracking() {
  const { id } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/academics/notes/${id}/tracking`);
        if (res.success) {
          setTrackingData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTracking();
  }, [id]);

  const attempts = trackingData?.attempts || [];
  const filtered = attempts.filter((att) => {
    const term = searchTerm.toLowerCase();
    const name = att.studentId?.personalDetails?.fullName?.toLowerCase() || '';
    const enroll = att.studentId?.enrollmentNo?.toLowerCase() || '';
    return name.includes(term) || enroll.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/admin/notes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68] mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Notes Table
          </Link>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Student Self-Assessment & Quiz Tracking
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Study Note: <strong className="text-[#0b3c68]">{trackingData?.note?.title || 'Loading...'}</strong> ({trackingData?.note?.chapterTitle})
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 px-5 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Attempts</span>
            <p className="font-display text-xl font-black text-[#0b3c68]">{attempts.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 px-5 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Questions Pool</span>
            <p className="font-display text-xl font-black text-emerald-700">
              {trackingData?.note?.totalQuestions || 0} MCQs
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student name or enrollment number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none shadow-sm"
        />
      </div>

      {/* Attempts Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Enrollment No</th>
                <th className="py-3.5 px-4">Score & Total</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Attempt Date & Time</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading attempt records...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No student quiz attempts recorded yet for this note.
                  </td>
                </tr>
              ) : (
                filtered.map((att, idx) => (
                  <tr key={att._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {att.studentId?.personalDetails?.fullName || 'Student'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      {att.studentId?.enrollmentNo || 'FTI-STU'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{att.score}</span>
                      <span className="text-slate-400"> / {att.totalQuestions} Marks</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={att.percentage >= 40 ? 'text-emerald-700' : 'text-red-600'}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(att.completedAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        att.status === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {att.status === 'Passed' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
