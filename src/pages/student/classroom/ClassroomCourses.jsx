import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE.replace(/\/api$/, '');

// PAGE 1: Enrolled Courses Grid -> click opens the course's video list page
export default function ClassroomCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({}); // courseId -> { total, watched }

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        // Only the student's enrolled courses (via Admissions)
        const res = await apiRequest('/courses/my/enrolled');
        if (!res.success) return;
        setCourses(res.courses || []);

        // Load watch progress for every enrolled course (for the selection cards)
        await Promise.all(
          (res.courses || []).map((c) =>
            apiRequest(`/lms/courses/${c._id}/videos`)
              .then((vRes) => {
                const list = vRes.success ? vRes.videos || [] : [];
                setProgress((prev) => ({
                  ...prev,
                  [c._id]: {
                    total: list.length,
                    watched: list.filter((v) => v.progress?.isWatched).length
                  }
                }));
              })
              .catch(() => {})
          )
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchEnrolled();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
          My Courses
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Select a course to view its lecture list — lectures unlock one-by-one as you complete them.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-2">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">No enrolled courses yet.</p>
          <p className="text-xs text-slate-400">Once you take admission, your courses will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const prog = progress[course._id] || { total: 0, watched: 0 };
            const percent = prog.total > 0 ? Math.round((prog.watched / prog.total) * 100) : 0;
            const thumbLink = course.thumbnail
              ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${SERVER_URL}${course.thumbnail}`)
              : '';

            return (
              <button
                key={course._id}
                onClick={() => navigate(`/student/classroom/course/${course._id}`, { state: { courseName: course.name } })}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:border-[#0b3c68]/30 text-left"
              >
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-[#082c4d] to-[#0b3c68]">
                  {thumbLink ? (
                    <img src={thumbLink} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-white/40" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0b3c68]">
                    {course.courseCode}
                  </span>
                  {percent === 100 && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-display text-sm font-black text-slate-900 line-clamp-1 group-hover:text-[#0b3c68]">
                      {course.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {course.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        <Clock className="h-2.5 w-2.5" /> {course.duration}
                      </span>
                    </div>
                  </div>

                  {/* Watch Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>{prog.watched}/{prog.total} Lectures Completed</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <span className="block pt-1 text-xs font-bold text-[#0b3c68] group-hover:underline">
                    {prog.watched > 0 ? 'Continue Learning →' : 'View Lectures →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
