import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import { ArrowLeft, CheckCircle2, Lock, PlayCircle, FileQuestion } from 'lucide-react';

// PAGE 2: Course Lecture List ONLY (no player) -> click a lecture to open the Watch page
export default function ClassroomVideos() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const courseName = location.state?.courseName || 'Course Playlist';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sequential learning: lecture N opens only after N-1 is completed
  const isLectureUnlocked = (index) =>
    index === 0 || Boolean(videos[index - 1]?.progress?.isWatched);

  useEffect(() => {
    if (!courseId) return undefined;
    const timer = setTimeout(() => {
      setLoading(true);
      apiRequest(`/lms/courses/${courseId}/videos`)
        .then((res) => {
          if (res.success) setVideos(res.videos || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [courseId]);

  const watchedCount = videos.filter((v) => v.progress?.isWatched).length;
  const percent = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/student/classroom')}
            className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> My Courses
          </button>
          <h1 className="font-display text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
            {courseName}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {videos.length} Lectures • Complete in sequence — click a lecture to open the player.
          </p>
        </div>

        {/* Progress widget */}
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm min-w-[180px]">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>Course Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="mt-0.5 text-right text-[9px] font-semibold text-slate-400">
            {watchedCount}/{videos.length} done
          </p>
        </div>
      </div>

      {/* LECTURE LIST */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="py-16 text-center space-y-1">
            <PlayCircle className="mx-auto h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-400 italic">No lectures uploaded for this course yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {videos.map((vid, idx) => {
              const unlocked = isLectureUnlocked(idx);
              const isWatched = vid.progress?.isWatched;

              return (
                <li
                  key={vid._id}
                  onClick={() => {
                    if (unlocked) {
                      navigate(`/student/classroom/watch/${courseId}/${vid._id}`, {
                        state: { courseName }
                      });
                    }
                  }}
                  title={unlocked ? `Play "${vid.title}"` : 'Complete the previous lecture to unlock'}
                  className={`flex items-center gap-4 px-5 py-4 transition ${
                    unlocked
                      ? 'cursor-pointer hover:bg-sky-50/60'
                      : 'cursor-not-allowed bg-slate-50/60 opacity-70'
                  } ${vid._id && !isWatched && unlocked ? 'hover:border-l-4 hover:border-[#0b3c68]' : ''}`}
                >
                  {/* Index / Status circle */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      isWatched
                        ? 'bg-emerald-100 text-emerald-700'
                        : unlocked
                          ? 'bg-sky-100 text-[#0b3c68]'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isWatched ? <CheckCircle2 className="h-5 w-5" /> : !unlocked ? <Lock className="h-4 w-4" /> : idx + 1}
                  </div>

                  {/* Title block */}
                  <div className="min-w-0 flex-1">
                    <p className={`font-display text-sm font-bold truncate ${unlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                      {unlocked ? vid.title : 'Complete previous lecture to reveal'}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 truncate">{vid.moduleTitle}</p>
                    {(vid.totalQuestions > 0 || vid.userAttempt) && unlocked && (
                      <div className="mt-1 flex items-center gap-1.5">
                        {vid.totalQuestions > 0 && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            <FileQuestion className="h-2.5 w-2.5" /> {vid.totalQuestions} MCQs
                          </span>
                        )}
                        {vid.userAttempt && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                              vid.userAttempt.status === 'Passed'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                          >
                            Quiz: {vid.userAttempt.percentage}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right status */}
                  <div className="shrink-0 text-right">
                    {!unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    ) : isWatched ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <>
                        <span className="block text-[10px] font-bold text-slate-400">
                          {Math.round(vid.durationInSeconds / 60)} min
                        </span>
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-black text-[#0b3c68]">
                          <PlayCircle className="h-3.5 w-3.5" /> Play
                        </span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
