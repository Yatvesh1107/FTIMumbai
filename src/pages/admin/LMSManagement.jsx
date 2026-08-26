import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  Video, Plus, Play, Sparkles, ExternalLink, FileVideo, X, Search,
  Pencil, Trash2, CheckCircle2, Link2, Unlink, Users, Globe,
  Calendar, Clock, AlertTriangle, Loader2
} from 'lucide-react';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function LMSManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [videos, setVideos] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [searchTerm, setSearchTerm] = useState('');

  // Google Auth
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Modals
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [activePlayUrl, setActivePlayUrl] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Live form
  const [liveForm, setLiveForm] = useState({
    title: '', agenda: '', meetLink: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM', endTime: '11:30 AM',
    targetType: 'all', targetBatches: [], targetStudents: []
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [targetStudentsList, setTargetStudentsList] = useState([]);

  // Handle Google OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      (async () => {
        try {
          await apiRequest('/lms/google/save-token', 'POST', { code });
          setGoogleLinked(true);
          window.history.replaceState({}, '', '/admin/lms');
        } catch { /* ignore */ }
      })();
    }
  }, [searchParams]);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [cRes, bRes, gRes] = await Promise.all([
          apiRequest('/courses'),
          apiRequest('/batches'),
          apiRequest('/lms/google/auth-status')
        ]);
        if (cRes.success && cRes.courses.length > 0) {
          setCourses(cRes.courses);
          setSelectedCourseId(cRes.courses[0]._id);
        }
        if (bRes.success) setBatches(bRes.batches || []);
        if (gRes.success) setGoogleLinked(gRes.isLinked);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  // Load course content
  const loadCourseContent = async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [vRes, lRes] = await Promise.all([
        apiRequest('/lms/courses/' + courseId + '/videos'),
        apiRequest('/lms/courses/' + courseId + '/live-sessions')
      ]);
      if (vRes.success) setVideos(vRes.videos || []);
      if (lRes.success) setLiveSessions(lRes.sessions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!selectedCourseId) return;
    const timer = setTimeout(() => { loadCourseContent(selectedCourseId); }, 0);
    return () => clearTimeout(timer);
  }, [selectedCourseId]);

  // Fetch students for individual targeting
  const fetchTargetStudents = async () => {
    try {
      const res = await apiRequest('/admissions?courseId=' + selectedCourseId);
      if (res.success) {
        const students = [];
        const seen = new Set();
        (res.admissions || []).forEach(a => {
          const s = a.studentId;
          if (s && !seen.has(s._id)) {
            seen.add(s._id);
            students.push({ _id: s._id, fullName: s.fullName, enrollmentNo: s.enrollmentNo });
          }
        });
        setTargetStudentsList(students);
      }
    } catch { /* ignore */ }
  };

  // Google OAuth
  const handleLinkGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await apiRequest('/lms/google/auth-url');
      if (res.success && res.url) window.location.href = res.url;
    } catch { alert('Failed to get Google auth URL'); }
    setGoogleLoading(false);
  };

  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Unlink Google account? You will need to re-authorize to auto-generate meet links.')) return;
    try {
      await apiRequest('/lms/google/unlink', 'POST');
      setGoogleLinked(false);
    } catch { /* ignore */ }
  };

  // Auto-generate meet link
  const handleAutoGenerate = async () => {
    if (!liveForm.scheduledDate || !liveForm.startTime || !liveForm.endTime) {
      alert('Please set date, start time, and end time first');
      return;
    }
    setGeneratingLink(true);
    try {
      const res = await apiRequest('/lms/google/generate-meet', 'POST', {
        title: liveForm.title || 'FTI Live Class',
        agenda: liveForm.agenda,
        date: liveForm.scheduledDate,
        startTime: liveForm.startTime,
        endTime: liveForm.endTime
      });
      if (res.success && res.link) {
        setLiveForm({ ...liveForm, meetLink: res.link });
      }
    } catch (err) {
      alert(err.message || 'Failed to generate link');
    }
    setGeneratingLink(false);
  };

  // Schedule live session
  const handleScheduleLive = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/lms/live-sessions', 'POST', {
        ...liveForm,
        courseId: selectedCourseId
      });
      if (res.success) {
        setLiveModalOpen(false);
        resetLiveForm();
        loadCourseContent(selectedCourseId);
      }
    } catch (err) { alert(err.message || 'Error scheduling session'); }
  };

  // Delete session
  const handleDeleteSession = async (id) => {
    try {
      await apiRequest('/lms/live-sessions/' + id, 'DELETE');
      setDeleteConfirm(null);
      loadCourseContent(selectedCourseId);
    } catch (err) { alert(err.message || 'Error deleting'); }
  };

  // Update session status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiRequest('/lms/live-sessions/' + id, 'PUT', { status: newStatus });
      loadCourseContent(selectedCourseId);
    } catch (err) { alert(err.message || 'Error updating status'); }
  };

  const resetLiveForm = () => {
    setLiveForm({
      title: '', agenda: '', meetLink: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM', endTime: '11:30 AM',
      targetType: 'all', targetBatches: [], targetStudents: []
    });
  };

  const openLiveModal = () => {
    resetLiveForm();
    fetchTargetStudents();
    setLiveModalOpen(true);
  };

  const toggleBatchTarget = (batchId) => {
    setLiveForm(prev => {
      const current = prev.targetBatches;
      const next = current.includes(batchId) ? current.filter(b => b !== batchId) : [...current, batchId];
      return { ...prev, targetBatches: next };
    });
  };

  const toggleStudentTarget = (studentId) => {
    setLiveForm(prev => {
      const current = prev.targetStudents;
      const next = current.includes(studentId) ? current.filter(s => s !== studentId) : [...current, studentId];
      return { ...prev, targetStudents: next };
    });
  };

  // Delete video
  const handleDeleteVideo = async (vid) => {
    if (!window.confirm('Delete "' + vid.title + '" permanently?')) return;
    try {
      await apiRequest('/lms/videos/' + vid._id, 'DELETE');
      loadCourseContent(selectedCourseId);
    } catch (err) { alert(err.message || 'Error deleting'); }
  };

  const filteredVideos = videos.filter((v) => {
    const term = searchTerm.toLowerCase();
    return v.title?.toLowerCase().includes(term) || v.moduleTitle?.toLowerCase().includes(term);
  });

  const filteredLive = liveSessions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.title?.toLowerCase().includes(term) || s.batchTiming?.toLowerCase().includes(term);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Live': return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
        </span>
      );
      case 'Completed': return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </span>
      );
      case 'Cancelled': return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-500">
          Cancelled
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
          <Clock className="h-3 w-3" /> Scheduled
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            LMS Videos & Google Meet Live Studio
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage video lectures and schedule Google Meet live classes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm"
          >
            {courses.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
          {activeTab === 'videos' ? (
            <button onClick={() => navigate('/admin/lms/upload')} className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]">
              <Plus className="h-4 w-4" /> Upload Video
            </button>
          ) : (
            <button onClick={openLiveModal} className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-800">
              <Sparkles className="h-4 w-4" /> Schedule Live GMeet
            </button>
          )}
        </div>
      </div>

      {/* Google Account Status */}
      <div className={`flex items-center justify-between rounded-2xl border p-4 ${googleLinked ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          {googleLinked ? <Link2 className="h-5 w-5 text-emerald-600" /> : <Unlink className="h-5 w-5 text-amber-600" />}
          <div>
            <p className={`text-xs font-bold ${googleLinked ? 'text-emerald-800' : 'text-amber-800'}`}>
              {googleLinked ? 'Google Account Linked' : 'Google Account Not Linked'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {googleLinked ? 'Auto-generate Google Meet links is enabled.' : 'Link your Google account to auto-generate Meet links.'}
            </p>
          </div>
        </div>
        {googleLinked ? (
          <button onClick={handleUnlinkGoogle} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition">
            Change Account
          </button>
        ) : (
          <button onClick={handleLinkGoogle} disabled={googleLoading} className="rounded-xl bg-[#0b3c68] px-4 py-1.5 text-[10px] font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-50 transition">
            {googleLoading ? 'Redirecting...' : 'Link Google Account'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('videos')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${activeTab === 'videos' ? 'bg-[#0b3c68] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Video className="h-4 w-4" /> Video Lectures ({videos.length})
        </button>
        <button onClick={() => setActiveTab('live')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${activeTab === 'live' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Sparkles className="h-4 w-4" /> GMeet Live ({liveSessions.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input type="text" placeholder={activeTab === 'videos' ? 'Search videos...' : 'Search sessions...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none shadow-sm" />
      </div>

      {/* VIDEOS TABLE */}
      {activeTab === 'videos' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">#</th>
                  <th className="py-3.5 px-4">Module / Chapter</th>
                  <th className="py-3.5 px-4">Lecture</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400"><div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent" /></td></tr>
                ) : filteredVideos.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400 italic">No videos found.</td></tr>
                ) : filteredVideos.map((vid, idx) => {
                  const videoLink = vid.videoUrl.startsWith('http') ? vid.videoUrl : SERVER_URL + vid.videoUrl;
                  const thumbLink = vid.thumbnailUrl ? (vid.thumbnailUrl.startsWith('http') ? vid.thumbnailUrl : SERVER_URL + vid.thumbnailUrl) : '';
                  return (
                    <tr key={vid._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4"><span className="rounded bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#0b3c68] border border-sky-100">{vid.moduleTitle}</span></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {thumbLink ? <img src={thumbLink} alt="" className="h-10 w-16 shrink-0 rounded-lg object-cover border border-slate-200" /> : <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200"><FileVideo className="h-4 w-4 text-slate-400" /></div>}
                          <div className="min-w-0"><span className="font-bold text-slate-900 block truncate">{vid.title}</span></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{Math.round(vid.durationInSeconds / 60)} min</span></td>
                      <td className="py-3.5 px-4">{vid.isActive === false ? <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">Inactive</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Active</span>}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setActivePlayUrl(videoLink)} title="Stream" className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-[11px] font-bold text-[#0b3c68] hover:bg-sky-100 transition"><Play className="h-3.5 w-3.5 fill-current" /> Stream</button>
                          <button onClick={() => navigate('/admin/lms/videos/edit/' + vid._id)} title="Edit" className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteVideo(vid)} title="Delete" className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIVE SESSIONS TABLE */}
      {activeTab === 'live' && (
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-purple-700 border-t-transparent" /></div>
          ) : filteredLive.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Sparkles className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No live sessions scheduled</p>
              <button onClick={openLiveModal} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-700 underline"><Plus className="h-3.5 w-3.5" /> Schedule one</button>
            </div>
          ) : filteredLive.map((session) => (
            <div key={session._id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-purple-200 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{session.title}</h3>
                    {getStatusBadge(session.status)}
                    {session.targetType && session.targetType !== 'all' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {session.targetType === 'batch' ? <Users className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {session.targetType === 'batch' ? 'Batch' : 'Individual'}
                      </span>
                    )}
                  </div>
                  {session.agenda && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{session.agenda}</p>}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500"><Calendar className="h-3 w-3" /> {new Date(session.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500"><Clock className="h-3 w-3" /> {session.startTime} - {session.endTime}</span>
                    {session.batchTiming && <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-900 border border-purple-200">{session.batchTiming}</span>}
                  </div>
                  {session.targetStudents?.length > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">Targeting {session.targetStudents.length} student{session.targetStudents.length > 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={session.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-800 transition">
                    <ExternalLink className="h-3 w-3" /> Join
                  </a>
                  <select value={session.status} onChange={(e) => handleStatusChange(session._id, e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => setDeleteConfirm(session._id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-2">Delete Session?</h3>
            <p className="text-xs text-slate-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDeleteSession(deleteConfirm)} className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Streaming Modal */}
      {activePlayUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <span className="text-xs font-bold">Lecture Streaming Preview</span>
              <button onClick={() => setActivePlayUrl(null)} className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"><X className="h-4 w-4" /></button>
            </div>
            <video src={activePlayUrl} controls autoPlay className="w-full aspect-video object-contain" />
          </div>
        </div>
      )}

      {/* Live Session Modal — Magma-style */}
      {liveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-display text-base font-bold text-slate-900">Schedule Google Meet Live Class</h3>
              <button onClick={() => setLiveModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleScheduleLive} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Session Topic */}
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Session Topic *</label>
                <input type="text" required value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} placeholder="e.g. React Project Review" className="w-full rounded-xl border border-slate-300 p-2.5 text-xs" />
              </div>

              {/* Agenda */}
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Agenda / Description</label>
                <textarea rows={2} value={liveForm.agenda} onChange={(e) => setLiveForm({ ...liveForm, agenda: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5 text-xs" placeholder="Brief description..." />
              </div>

              {/* Google Meet Link with auto-generate */}
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Google Meet Link *</label>
                <div className="flex gap-2">
                  <input type="url" value={liveForm.meetLink} onChange={(e) => setLiveForm({ ...liveForm, meetLink: e.target.value })} placeholder="https://meet.google.com/xxx-xxxx-xxx" className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs font-mono" />
                  {googleLinked && (
                    <button type="button" onClick={handleAutoGenerate} disabled={generatingLink} className="shrink-0 rounded-xl bg-purple-700 px-3 py-2 text-[10px] font-bold text-white hover:bg-purple-800 disabled:opacity-50 transition">
                      {generatingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {googleLinked && <p className="text-[10px] text-emerald-600 mt-1">Click the link icon to auto-generate a Meet link.</p>}
                {!liveForm.meetLink && <p className="text-[10px] text-amber-600 mt-1">Paste a Meet link or link Google to auto-generate.</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">Date *</label>
                  <input type="date" required value={liveForm.scheduledDate} onChange={(e) => setLiveForm({ ...liveForm, scheduledDate: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">Start Time *</label>
                  <input type="text" required value={liveForm.startTime} onChange={(e) => setLiveForm({ ...liveForm, startTime: e.target.value })} placeholder="10:00 AM" className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">End Time *</label>
                  <input type="text" required value={liveForm.endTime} onChange={(e) => setLiveForm({ ...liveForm, endTime: e.target.value })} placeholder="11:30 AM" className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-2">Target Audience</label>
                <div className="flex gap-2">
                  {[{ k: 'all', label: 'All Students', icon: Globe }, { k: 'batch', label: 'Specific Batches', icon: Users }, { k: 'individual', label: 'Individual Students', icon: Users }].map(({ k, label }) => (
                    <button key={k} type="button" onClick={() => setLiveForm({ ...liveForm, targetType: k })} className={`rounded-xl px-3 py-1.5 text-[10px] font-bold transition ${liveForm.targetType === k ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {liveForm.targetType === 'batch' && (
                  <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1">
                    {batches.length === 0 ? <p className="text-[10px] text-slate-400 italic">No batches found</p> : batches.map(b => (
                      <label key={b._id} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-50">
                        <input type="checkbox" checked={liveForm.targetBatches.includes(b._id)} onChange={() => toggleBatchTarget(b._id)} className="rounded" />
                        <span className="text-[10px] font-semibold text-slate-700">{b.name || b.batchName}</span>
                      </label>
                    ))}
                  </div>
                )}

                {liveForm.targetType === 'individual' && (
                  <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1">
                    {targetStudentsList.length === 0 ? <p className="text-[10px] text-slate-400 italic">No students found</p> : targetStudentsList.map(s => (
                      <label key={s._id} className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-50">
                        <input type="checkbox" checked={liveForm.targetStudents.includes(s._id)} onChange={() => toggleStudentTarget(s._id)} className="rounded" />
                        <span className="text-[10px] font-semibold text-slate-700">{s.fullName} ({s.enrollmentNo})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setLiveModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-purple-700 px-5 py-2 text-xs font-bold text-white hover:bg-purple-800 shadow">Schedule Live Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
