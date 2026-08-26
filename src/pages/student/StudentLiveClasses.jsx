import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Video, ExternalLink, Calendar, Clock, Loader2, Sparkles,
  CheckCircle2, RefreshCw
} from 'lucide-react';

export default function StudentLiveClasses() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const mountedRef = useRef(true);

  const fetchSessions = async () => {
    try {
      const res = await apiRequest('/lms/live/my');
      if (res.success && mountedRef.current) setSessions(res.sessions || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    mountedRef.current = true;
    setTimeout(() => { fetchSessions().finally(() => { if (mountedRef.current) setLoading(false); }); }, 0);
    const interval = setInterval(fetchSessions, 60000);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, []);

  const filtered = sessions.filter((s) => {
    if (filter === 'live') return s.status === 'Live';
    if (filter === 'upcoming') return s.status === 'Scheduled';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Live': return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          LIVE NOW
        </span>
      );
      case 'Completed': return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
          <Clock className="h-3 w-3" /> Upcoming
        </span>
      );
    }
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-700 p-3 shadow-lg">
              <Video className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Live Classes</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {sessions.filter(s => s.status === 'Live').length > 0
                  ? sessions.filter(s => s.status === 'Live').length + ' class live right now!'
                  : sessions.length + ' session' + (sessions.length !== 1 ? 's' : '') + ' scheduled'}
              </p>
            </div>
          </div>
          <button onClick={() => { setLoading(true); fetchSessions().finally(() => setLoading(false)); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[{ k: 'all', label: 'All (' + sessions.length + ')' }, { k: 'live', label: 'Live Now' }, { k: 'upcoming', label: 'Upcoming' }].map(({ k, label }) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filter === k ? 'bg-purple-700 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Session Cards */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 text-purple-400 mx-auto animate-spin mb-3" />
            <p className="text-sm text-slate-400">Loading live classes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <Sparkles className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-400">No live classes scheduled</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for upcoming sessions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((session) => {
              const isLive = session.status === 'Live';
              return (
                <div key={session._id} className={`rounded-3xl border-2 p-5 sm:p-6 transition ${
                  isLive ? 'border-red-300 bg-red-50/50 shadow-lg shadow-red-100' : 'border-slate-200 bg-white hover:border-purple-200'
                }`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                      isLive ? 'bg-red-500 animate-pulse' : 'bg-purple-100'
                    }`}>
                      <Video className={`h-6 w-6 ${isLive ? 'text-white' : 'text-purple-600'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base font-bold text-slate-900">{session.title}</h3>
                        {getStatusBadge(session.status)}
                      </div>

                      {session.courseId?.name && (
                        <p className="text-xs text-purple-600 font-semibold mb-1">{session.courseId.name}</p>
                      )}

                      {session.agenda && (
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{session.agenda}</p>
                      )}

                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(session.scheduledDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" /> {session.startTime} - {session.endTime}
                        </span>
                        {session.batchTiming && session.batchTiming !== 'All Batches' && (
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">{session.batchTiming}</span>
                        )}
                        {session.trainerId?.name && (
                          <span className="text-[10px] text-slate-400">by {session.trainerId.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Join Button */}
                    <div className="flex-shrink-0">
                      {isLive ? (
                        <a href={session.meetLink} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 transition animate-pulse">
                          <ExternalLink className="h-4 w-4" /> Join Now
                        </a>
                      ) : (
                        <div className="text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500">
                            <Clock className="h-4 w-4" /> Waiting to start
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-4 text-center">
          <p className="text-[10px] text-slate-400">
            The "Join" button will appear exactly at the start time. This page auto-refreshes every 60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
