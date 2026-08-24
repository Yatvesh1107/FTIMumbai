import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Video,
  Plus,
  Play,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Upload,
  FileVideo,
  Eye,
  CheckCircle2,
  X,
  Search,
  Filter
} from 'lucide-react';

export default function LMSManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [videos, setVideos] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'live'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Player
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [activePlayUrl, setActivePlayUrl] = useState(null);

  const videoInputRef = useRef(null);

  const [videoForm, setVideoForm] = useState({
    moduleTitle: 'Module 1: Foundations',
    title: '',
    description: '',
    videoUrl: '',
    durationInSeconds: 900
  });

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
    if (selectedCourseId) {
      loadCourseContent(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setUploadingVideo(true);

    try {
      const token = localStorage.getItem('fti_token');
      const formData = new FormData();
      formData.append('courseId', selectedCourseId);
      formData.append('moduleTitle', videoForm.moduleTitle);
      formData.append('title', videoForm.title);
      formData.append('description', videoForm.description);

      if (videoFile) {
        formData.append('video', videoFile);
      } else if (videoForm.videoUrl) {
        formData.append('videoUrl', videoForm.videoUrl);
      } else {
        alert('Please choose a video file or enter video URL');
        setUploadingVideo(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/lms/videos', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Video upload failed');
      }

      setVideoModalOpen(false);
      setVideoFile(null);
      setVideoForm({ moduleTitle: 'Module 1: Foundations', title: '', description: '', videoUrl: '', durationInSeconds: 900 });
      loadCourseContent(selectedCourseId);
    } catch (err) {
      alert(err.message || 'Error uploading video');
    } finally {
      setUploadingVideo(false);
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
              onClick={() => setVideoModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
            >
              <Plus className="h-4 w-4" /> + Upload Video Lecture
            </button>
          ) : (
            <button
              onClick={() => setLiveModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-800"
            >
              <Sparkles className="h-4 w-4" /> + Schedule Live GMeet
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
          <Video className="h-4 w-4" /> Video Lectures Table ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'live'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-4 w-4" /> GMeet Live Schedules Table ({liveSessions.length})
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
                  <th className="py-3.5 px-4">Lecture Title</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Created Date</th>
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
                        onClick={() => setVideoModalOpen(true)}
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
                      : `http://localhost:5000${vid.videoUrl}`;

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
                          <span className="font-bold text-slate-900 block">{vid.title}</span>
                          {vid.description && (
                            <span className="text-[10px] text-slate-400 line-clamp-1">{vid.description}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {Math.round(vid.durationInSeconds / 60)} Minutes
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(vid.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setActivePlayUrl(videoLink)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-[#0b3c68] hover:bg-sky-100 transition"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" /> Stream Video
                          </button>
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

      {/* Upload Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Upload Video Lecture</h3>
              <button onClick={() => setVideoModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Module / Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={videoForm.moduleTitle}
                  onChange={(e) => setVideoForm({ ...videoForm, moduleTitle: e.target.value })}
                  placeholder="e.g. Module 1: HTML5 & Architecture"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Semantic Tags & Box Model"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                />
              </div>

              {/* Upload Video File */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <label className="block text-slate-700 font-bold uppercase text-[10px]">Upload Video File (.mp4, .mkv, .mov)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm hover:bg-slate-100"
                  >
                    <FileVideo className="h-4 w-4" /> {videoFile ? videoFile.name : 'Choose Video File'}
                  </button>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="hidden"
                  />
                  {videoFile && <span className="text-[10px] text-emerald-700 font-bold">Selected ({Math.round(videoFile.size / (1024*1024))} MB)</span>}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Or Video URL (Direct / Embed)</label>
                <input
                  type="url"
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="https://example.com/lecture.mp4"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setVideoModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingVideo}
                  className="rounded-xl bg-[#0b3c68] px-5 py-2 text-white font-bold disabled:opacity-40"
                >
                  {uploadingVideo ? 'Compressing & Uploading...' : 'Save Lecture'}
                </button>
              </div>
            </form>
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
