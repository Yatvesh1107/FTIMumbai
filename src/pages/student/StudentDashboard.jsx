import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import {
  Video,
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [feeDoc, setFeeDoc] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentHub = async () => {
      try {
        const cRes = await apiRequest('/courses');
        if (cRes.success && cRes.courses.length > 0) {
          setCourses(cRes.courses);
          const first = cRes.courses[0];
          setActiveCourse(first);

          const [vRes, lRes] = await Promise.all([
            apiRequest('/lms/courses/' + first._id + '/videos'),
            apiRequest('/lms/live/my')
          ]);
          if (vRes.success) setVideos(vRes.videos || []);
          if (lRes.success) setLiveSessions(lRes.sessions || []);
        }

        if (user?.studentId) {
          const fRes = await apiRequest(`/fees/student/${user.studentId}`);
          if (fRes.success) setFeeDoc(fRes.feePayment);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentHub();
  }, [user]);

  const watchedCount = videos.filter((v) => v.progress?.isWatched).length;
  const progressPercent = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  const formatTime = (t) => {
    if (!t) return '';
    const clean = String(t).trim();
    if (clean.toUpperCase().includes('AM') || clean.toUpperCase().includes('PM')) return clean;
    const parts = clean.split(':');
    if (parts.length < 2) return clean;
    let h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + String(m).padStart(2, '0') + ' ' + suffix;
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#082c4d] via-[#0b3c68] to-[#12518a] p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/10 text-sky-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Student Learning Portal
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
            Hello, {user?.name}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-200">
            Enrolled in <strong className="text-sky-300">{activeCourse?.name || 'Master Web Development'}</strong>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10 min-w-[140px]">
          <span className="text-[10px] uppercase font-bold text-sky-200">Overall Progress</span>
          <span className="font-display text-3xl font-black text-white mt-0.5">{progressPercent}%</span>
          <span className="text-[10px] text-slate-300 mt-0.5">{watchedCount} of {videos.length} Lectures Done</span>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/student/classroom"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0b3c68] hover:shadow-md transition group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b3c68] group-hover:bg-[#0b3c68] group-hover:text-white transition">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Video Classroom</h4>
            <p className="text-[10px] text-slate-400">Stream recorded lectures</p>
          </div>
        </Link>

        <Link
          to="/student/live-classes"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-600 hover:shadow-md transition group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Live GMeet Classes</h4>
            <p className="text-[10px] text-slate-400">Join real-time lectures</p>
          </div>
        </Link>

        <Link
          to="/student/notes"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-600 hover:shadow-md transition group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Study Notes & Handouts</h4>
            <p className="text-[10px] text-slate-400">Read & download PDFs</p>
          </div>
        </Link>

        <Link
          to="/student/exams"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-600 hover:shadow-md transition group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Assessments & Tests</h4>
            <p className="text-[10px] text-slate-400">MCQs & Certifications</p>
          </div>
        </Link>
      </div>

      {/* Lectures Playlist Preview & Next Live Class */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Next Lectures */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-slate-800">Course Video Lectures</h3>
              <p className="text-xs text-slate-500">Pick up where you left off</p>
            </div>
            <Link
              to="/student/classroom"
              className="text-xs font-bold text-[#0b3c68] flex items-center gap-1 hover:underline"
            >
              Open Classroom <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {videos.slice(0, 4).map((v) => (
              <div
                key={v._id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-white hover:border-slate-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    v.progress?.isWatched ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {v.progress?.isWatched ? <CheckCircle2 className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{v.title}</h4>
                    <p className="text-[10px] text-slate-400">{v.moduleTitle}</p>
                  </div>
                </div>
                <Link
                  to="/student/classroom"
                  className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#0b3c68] shadow-sm border border-slate-200 hover:bg-[#0b3c68] hover:text-white transition"
                >
                  Watch
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Next Live Session Widget */}
        <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-purple-200/80 px-2.5 py-0.5 text-[10px] font-bold text-purple-900">
              Live Classes
            </span>
            <Sparkles className="h-4 w-4 text-purple-700 animate-pulse" />
          </div>

          {liveSessions.length > 0 ? (() => {
            const liveNow = liveSessions.find(s => s.status === 'Live');
            const next = liveNow || liveSessions[0];
            const isLive = next.status === 'Live';
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-slate-900">{next.title}</h3>
                  {isLive && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
                {next.courseId?.name && <p className="text-[10px] text-purple-600 font-semibold">{next.courseId.name}</p>}
                <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-purple-700" />
                  {formatTime(next.startTime)} - {formatTime(next.endTime)}
                </p>
                {isLive ? (
                  <a href={next.meetLink} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 transition animate-pulse">
                    <ExternalLink className="h-3.5 w-3.5" /> Join Live Now
                  </a>
                ) : (
                  <Link to="/student/live-classes" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-800 transition">
                    View All Sessions
                  </Link>
                )}
              </div>
            );
          })() : (
            <p className="text-xs text-slate-500 italic py-4">No live classes scheduled.</p>
          )}

          {/* Fee summary pill */}
          {feeDoc && (
            <div className="border-t border-purple-200/80 pt-4 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Account</span>
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Remaining Balance:</span>
                <span className="font-bold text-[#0b3c68]">₹{feeDoc.remainingAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
