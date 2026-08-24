import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Filter,
  Users,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';

export default function StudyNotesList() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('All');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await apiRequest('/courses');
      if (res.success) setCourses(res.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      if (selectedCourseId !== 'All') {
        const res = await apiRequest(`/academics/courses/${selectedCourseId}/notes`);
        if (res.success) {
          const course = courses.find(c => c._id === selectedCourseId);
          setNotes((res.notes || []).map(n => ({ ...n, courseName: course?.name })));
        }
      } else {
        if (courses.length > 0) {
          const allPromises = courses.map(c => apiRequest(`/academics/courses/${c._id}/notes`));
          const allRes = await Promise.all(allPromises);
          const combined = allRes.flatMap((r, i) =>
            (r.notes || []).map(n => ({ ...n, courseName: courses[i]?.name }))
          );
          setNotes(combined);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchNotes();
    }
  }, [courses, selectedCourseId]);

  const filtered = notes.filter((n) => {
    const term = searchTerm.toLowerCase();
    return (
      n.title?.toLowerCase().includes(term) ||
      n.chapterTitle?.toLowerCase().includes(term) ||
      n.courseName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Study Notes & Chapter Practice Quizzes
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage course-level PDF notes, attached MCQs, and track student self-assessment attempts.
          </p>
        </div>

        <Link
          to="/admin/notes/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Upload Study Notes & MCQs
        </Link>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by chapter, note title, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-bold text-[#0b3c68] focus:border-[#0b3c68] focus:outline-none"
          >
            <option value="All">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pristine Data Table with MCQs & Tracking */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">#</th>
                <th className="py-3.5 px-4">Chapter / Module</th>
                <th className="py-3.5 px-4">Study Note Title</th>
                <th className="py-3.5 px-4">Course Name</th>
                <th className="py-3.5 px-4">Attached MCQs</th>
                <th className="py-3.5 px-4">Student Attempts</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading study notes...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic space-y-2">
                    <p>No study notes found matching criteria.</p>
                    <Link to="/admin/notes/upload" className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3c68] underline">
                      <Plus className="h-3.5 w-3.5" /> Upload new study note
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((note, idx) => {
                  const pdfUrl = note.fileUrl.startsWith('http')
                    ? note.fileUrl
                    : `http://localhost:5000${note.fileUrl}`;

                  const mcqCount = note.questions ? note.questions.length : (note.totalQuestions || 0);

                  return (
                    <tr key={note._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0b3c68]">
                        <span className="rounded bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#0b3c68] border border-sky-100">
                          {note.chapterTitle}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{note.title}</span>
                        {note.description && (
                          <span className="text-[10px] text-slate-400 line-clamp-1">{note.description}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {note.courseName || 'FTI Course'}
                      </td>
                      <td className="py-3.5 px-4">
                        {mcqCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            <HelpCircle className="h-3 w-3 text-emerald-600" /> {mcqCount} MCQs
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No MCQs</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <Link
                          to={`/admin/notes/tracking/${note._id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100"
                        >
                          <Users className="h-3 w-3" /> {note.totalAttempts || 0} Attempts
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setPreviewPdfUrl(pdfUrl);
                              setPreviewTitle(note.title);
                            }}
                            className="rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-[#0b3c68] hover:bg-sky-100 transition inline-flex items-center gap-1"
                            title="Preview PDF"
                          >
                            <Eye className="h-3.5 w-3.5" /> PDF
                          </button>
                          <Link
                            to={`/admin/notes/tracking/${note._id}`}
                            className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition inline-flex items-center gap-1"
                            title="View Student Tracking"
                          >
                            <Users className="h-3.5 w-3.5" /> Tracking
                          </Link>
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

      {/* PDF Document Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0b3c68]" /> {previewTitle}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#0b3c68] px-3.5 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="rounded-full bg-white border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewPdfUrl}
                title="PDF Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
