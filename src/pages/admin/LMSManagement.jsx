import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  Video,
  Plus,
  Play,
  Sparkles,
  ExternalLink,
  FileVideo,
  X,
  Search,
  Pencil,
  Trash2,
  CheckCircle2
} from 'lucide-react';

// Derive Server base from env (no hardcoded localhost)
const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function LMSManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [videos, setVideos] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'live'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Player
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [activePlayUrl, setActivePlayUrl] = useState(null);

  const [liveForm, setLiveForm] = useState({
    title: '',
    agenda: '',
    meetLink: 'https://meet.google.com/',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    batchTiming: 'Morning Batch'
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
          setSelectedCourseId(res.courses[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const loadCourseContent = async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [vRes, lRes] = await Promise.all([
        apiRequest(`/lms/courses/${courseId}/videos`),
        apiRequest(`/lms/courses/${courseId}/live-sessions`)
      ]);
      if (vRes.success) setVideos(vRes.videos || []);
      if (lRes.success) setLiveSessions(lRes.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourseId) return;
    const timer = setTimeout(() => loadCourseContent(selectedCourseId), 0);
    return () => clearTimeout(timer);
  }, [selectedCourseId]);

  // Upload/Edit now happens on the dedicated Video Lecture Studio page
  const handleDeleteVideo = async (vid) => {
    if (!window.confirm(`Delete "${vid.title}" permanently? The stored video file will also be removed.`)) return;
    try {
      await apiRequest(`/lms/videos/${vid._id}`, 'DELETE');
      loadCourseContent(selectedCourseId);
    } catch (err) {
      alert(err.message || 'Error deleting video');
    }
  };

  const handleScheduleLive = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/lms/live-sessions', 'POST', {
        ...liveForm,
        courseId: selectedCourseId
      });
      if (res.success) {
        setLiveModalOpen(false);
        setLiveForm({ title: '', agenda: '', meetLink: 'https://meet.google.com/', scheduledDate: new Date().toISOString().split('T')[0], startTime: '10:00 AM', endTime: '11:30 AM', batchTiming: 'Morning Batch' });
        loadCourseContent(selectedCourseId);
      }
    } catch (err) {
      alert(err.message || 'Error scheduling session');
    }
  };

  const filteredVideos = videos.filter((v) => {
    const term = searchTerm.toLowerCase();
    return v.title?.toLowerCase().includes(term) || v.moduleTitle?.toLowerCase().includes(term);
  });

  const filteredLive = liveSessions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.title?.toLowerCase().includes(term) || s.batchTiming?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            LMS Videos & Google Meet Live Studio
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage course-wise video lectures with auto-compression and schedule Google Meet live classes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {activeTab === 'videos' ? (
            <button
              onClick={() => navigate('/admin/lms/upload')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
            >
              <Plus className="h-4 w-4" /> Upload Video Lecture
            </button>
          ) : (
            <button
              onClick={() => setLiveModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-800"
            >
              <Sparkles className="h-4 w-4" /> Schedule Live GMeet
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'videos'
              ? 'bg-[#0b3c68] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Video className="h-4 w-4" /> Video Lectures ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'live'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-4 w-4" /> GMeet Live Schedules ({liveSessions.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={activeTab === 'videos' ? 'Search video lectures by title or module...' : 'Search live sessions by topic or batch...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none shadow-sm"
        />
      </div>

      {/* TAB 1: VIDEOS TABLE */}
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
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                      <span className="block mt-2 text-[11px]">Loading lectures...</span>
                    </td>
                  </tr>
                ) : filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic space-y-2">
                      <p>No video lectures found for this course.</p>
                      <button
                        onClick={() => navigate('/admin/lms/upload')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3c68] underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Upload first video lecture
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((vid, idx) => {
                    const videoLink = vid.videoUrl.startsWith('http')
                      ? vid.videoUrl
                      : `${SERVER_URL}${vid.videoUrl}`;
                    const thumbLink = vid.thumbnailUrl
                      ? vid.thumbnailUrl.startsWith('http')
                        ? vid.thumbnailUrl
                        : `${SERVER_URL}${vid.thumbnailUrl}`
                      : '';

                    return (
                      <tr key={vid._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#0b3c68]">
                          <span className="rounded bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#0b3c68] border border-sky-100">
                            {vid.moduleTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {thumbLink ? (
                              <img src={thumbLink} alt="" className="h-10 w-16 shrink-0 rounded-lg object-cover border border-slate-200" />
                            ) : (
                              <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                                <FileVideo className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{vid.title}</span>
                              {vid.description && (
                                <span className="text-[10px] text-slate-400 line-clamp-1">{vid.description}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {Math.round(vid.durationInSeconds / 60)} Minutes
                            </span>
                            {vid.totalQuestions > 0 && (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                {vid.totalQuestions} MCQs
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {vid.isActive === false ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              Inactive
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActivePlayUrl(videoLink)}
                              title="Stream video"
                              className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-[11px] font-bold text-[#0b3c68] hover:bg-sky-100 transition"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" /> Stream
                            </button>
                            <button
                              onClick={() => navigate(`/admin/lms/videos/edit/${vid._id}`)}
                              title="Edit lecture"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(vid)}
                              title="Delete lecture"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SCHEDULES TABLE */}
      {activeTab === 'live' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">#</th>
                  <th className="py-3.5 px-4">Session Topic / Agenda</th>
                  <th className="py-3.5 px-4">Batch Timing</th>
                  <th className="py-3.5 px-4">Scheduled Date</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4 text-center">GMeet Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-purple-700 border-t-transparent"></div>
                      <span className="block mt-2 text-[11px]">Loading sessions...</span>
                    </td>
                  </tr>
                ) : filteredLive.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic space-y-2">
                      <p>No live classes scheduled for this course.</p>
                      <button
                        onClick={() => setLiveModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Schedule GMeet class
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredLive.map((session, idx) => (
                    <tr key={session._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{session.title}</span>
                        {session.agenda && (
                          <span className="text-[10px] text-slate-400 line-clamp-1">{session.agenda}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-900 border border-purple-200">
                          {session.batchTiming}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {new Date(session.scheduledDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-purple-700 font-bold">
                        {session.startTime} - {session.endTime}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={session.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-800 transition"
                        >
                          <ExternalLink className="h-3 w-3" /> Join GMeet
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Streaming Modal */}
      {activePlayUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <span className="text-xs font-bold">Lecture Streaming Preview</span>
              <button
                onClick={() => setActivePlayUrl(null)}
                className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <video
              src={activePlayUrl}
              controls
              autoPlay
              className="w-full aspect-video object-contain"
            />
          </div>
        </div>
      )}

      {/* Live Session Modal */}
      {liveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Schedule Google Meet Live Class</h3>
              <button onClick={() => setLiveModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleScheduleLive} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Session Topic *</label>
                <input
                  type="text"
                  required
                  value={liveForm.title}
                  onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                  placeholder="e.g. Live Project Review & Q&A"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Google Meet Link *</label>
                <input
                  type="url"
                  required
                  value={liveForm.meetLink}
                  onChange={(e) => setLiveForm({ ...liveForm, meetLink: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Date *</label>
                  <input
                    type="date"
                    required
                    value={liveForm.scheduledDate}
                    onChange={(e) => setLiveForm({ ...liveForm, scheduledDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Batch Timing</label>
                  <input
                    type="text"
                    value={liveForm.batchTiming}
                    onChange={(e) => setLiveForm({ ...liveForm, batchTiming: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Start Time</label>
                  <input
                    type="text"
                    value={liveForm.startTime}
                    onChange={(e) => setLiveForm({ ...liveForm, startTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">End Time</label>
                  <input
                    type="text"
                    value={liveForm.endTime}
                    onChange={(e) => setLiveForm({ ...liveForm, endTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setLiveModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-purple-700 px-5 py-2 text-white font-bold">
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
