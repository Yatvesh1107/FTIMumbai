import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Sparkles,
  Calendar,
  Clock,
  ExternalLink,
  Video
} from 'lucide-react';

export default function StudentLiveClasses() {
  const [courses, setCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const cRes = await apiRequest('/courses');
        if (cRes.success && cRes.courses.length > 0) {
          setCourses(cRes.courses);
          const first = cRes.courses[0];
          const lRes = await apiRequest(`/lms/courses/${first._id}/live-sessions`);
          if (lRes.success) setLiveSessions(lRes.sessions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
          Live Classes & Interactive Mentorship
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Join real-time scheduled video classes directly via Google Meet.
        </p>
      </div>

      {/* Live Sessions Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {liveSessions.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-purple-200 bg-purple-50/40 p-12 text-center text-slate-500 italic">
            No live interactive classes scheduled right now. Check back soon!
          </div>
        ) : (
          liveSessions.map((session) => (
            <div
              key={session._id}
              className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-100 px-3 py-0.5 text-[10px] font-bold text-purple-900">
                  {session.batchTiming}
                </span>
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(session.scheduledDate).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{session.title}</h3>
                <p className="mt-1 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-purple-600" /> {session.startTime} - {session.endTime}
                </p>
              </div>

              {session.agenda && (
                <p className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                  <strong>Agenda:</strong> {session.agenda}
                </p>
              )}

              <a
                href={session.meetLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 py-3 text-xs font-bold text-white shadow-md hover:bg-purple-800 transition"
              >
                <ExternalLink className="h-4 w-4" /> Join Live Google Meet
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
