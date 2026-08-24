import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Video,
  Play,
  CheckCircle2,
  Download,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export default function StudentClassroom() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
          const first = res.courses[0];
          setSelectedCourse(first);
          loadVideos(first._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassroom();
  }, []);

  const loadVideos = async (courseId) => {
    try {
      const res = await apiRequest(`/lms/courses/${courseId}/videos`);
      if (res.success) {
        setVideos(res.videos || []);
        if (res.videos.length > 0) {
          setActiveVideo(res.videos[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoEnded = async () => {
    if (!activeVideo) return;
    try {
      await apiRequest(`/lms/videos/${activeVideo._id}/progress`, 'POST', {
        watchedSeconds: activeVideo.durationInSeconds || 600,
        durationInSeconds: activeVideo.durationInSeconds || 600
      });
      // Refresh playlist progress
      loadVideos(selectedCourse._id);
    } catch (e) {
      console.error('Progress sync error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Video Classroom & Course Modules
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Watch high-definition lectures, complete modules, and track your progress.
          </p>
        </div>

        {courses.length > 1 && (
          <select
            value={selectedCourse?._id}
            onChange={(e) => {
              const c = courses.find((crs) => crs._id === e.target.value);
              setSelectedCourse(c);
              loadVideos(c._id);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-[#0b3c68]"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Classroom Video Player & Playlist Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Video Screen */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-xl">
            {activeVideo ? (
              <video
                key={activeVideo._id}
                src={activeVideo.videoUrl}
                controls
                autoPlay
                onEnded={handleVideoEnded}
                className="w-full aspect-video object-contain"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-slate-400 text-xs">
                Select a lecture from the playlist to begin
              </div>
            )}
          </div>

          {activeVideo && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#0b3c68]">
                  {activeVideo.moduleTitle}
                </span>
                {activeVideo.progress?.isWatched && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Completed
                  </span>
                )}
              </div>

              <h2 className="font-display text-lg font-black text-slate-900">{activeVideo.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeVideo.description || 'Hands-on training tutorial covering core architectural topics and project workflows.'}
              </p>

              {/* Mark Complete button for testing */}
              <div className="pt-2">
                <button
                  onClick={handleVideoEnded}
                  className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                >
                  ✓ Mark Video Lecture as Finished
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Course Playlist Sidebar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 max-h-[600px] overflow-y-auto">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display text-sm font-bold text-slate-800">Course Syllabus & Playlist</h3>
            <p className="text-[11px] text-slate-400">{videos.length} Lectures Available</p>
          </div>

          <div className="space-y-2">
            {videos.map((vid, idx) => {
              const isCurrent = activeVideo?._id === vid._id;
              const isWatched = vid.progress?.isWatched;

              return (
                <div
                  key={vid._id}
                  onClick={() => setActiveVideo(vid)}
                  className={`cursor-pointer rounded-2xl border p-3 transition ${
                    isCurrent
                      ? 'border-[#0b3c68] bg-sky-50/60 ring-2 ring-[#0b3c68]/20'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Lesson #{idx + 1}</span>
                    {isWatched ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">{Math.round(vid.durationInSeconds / 60)} min</span>
                    )}
                  </div>
                  <h4 className="mt-1 font-display text-xs font-bold text-slate-900 line-clamp-1">
                    {vid.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
