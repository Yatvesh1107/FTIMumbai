import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Clock,
  Calendar,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ExternalLink,
  Download,
  FileText,
  X,
  Search,
  Award
} from 'lucide-react';

export default function StudentAssignments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
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
    fetchInit();
  }, []);

  const loadAssignments = async (courseId) => {
    try {
      setLoading(true);
      const res = await apiRequest(`/academics/courses/${courseId}/assignments`);
      if (res.success) {
        setAssignments(res.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadAssignments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionUrl) return;

    setSubmitting(true);
    try {
      const res = await apiRequest(`/academics/assignments/${selectedAssignment._id}/submit`, 'POST', {
        submissionFileUrl: submissionUrl,
        submissionNotes
      });
      if (res.success) {
        setSubmitModalOpen(false);
        setSubmissionUrl('');
        setSubmissionNotes('');
        loadAssignments(selectedCourseId);
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = assignments.filter((a) => {
    const term = searchTerm.toLowerCase();
    return a.title?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Practical Assignments & Project Deliverables
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Download assignment guidelines, submit deliverables (GitHub / Drive), and review evaluations.
          </p>
        </div>

        {courses.length > 1 && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-teal-800"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search practical assignments by task title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-teal-700 focus:outline-none shadow-sm"
        />
      </div>

      {/* Pristine Student Assignments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">Assignment Title & Handout</th>
                <th className="py-3.5 px-4">Max Marks</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4">Evaluation & Marks</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-teal-700 border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading assignments...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No active assignments assigned for this course.
                  </td>
                </tr>
              ) : (
                filtered.map((ass, idx) => {
                  const sub = ass.submission;
                  const isSubmitted = sub && (sub.status === 'Submitted' || sub.status === 'Graded');
                  const materialPdf = ass.material?.pdfUrl
                    ? ass.material.pdfUrl.startsWith('http')
                      ? ass.material.pdfUrl
                      : `http://localhost:5000${ass.material.pdfUrl}`
                    : null;

                  return (
                    <tr key={ass._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block text-sm">{ass.title}</span>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ass.instructions}</p>
                        {materialPdf && (
                          <a
                            href={materialPdf}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#0b3c68] hover:underline"
                          >
                            <Download className="h-3 w-3" /> Download Reference Handout (PDF)
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                          {ass.totalMarks} Marks
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-amber-700">
                        {new Date(ass.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub?.status === 'Graded' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-sm">
                              <Award className="h-4 w-4" /> {sub.obtainedMarks} / {ass.totalMarks} Marks
                            </span>
                            {sub.facultyFeedback && (
                              <p className="text-[10px] text-slate-500 mt-0.5 italic">
                                Feedback: "{sub.facultyFeedback}"
                              </p>
                            )}
                          </div>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-[#0b3c68]">
                            <CheckCircle2 className="h-3 w-3" /> Submitted (In Review)
                          </span>
                        ) : (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                            Pending Submission
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedAssignment(ass);
                            setSubmissionUrl(sub?.submissionFileUrl || '');
                            setSubmissionNotes(sub?.submissionNotes || '');
                            setSubmitModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow transition ${
                            isSubmitted
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-teal-700 text-white hover:bg-teal-800'
                          }`}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {isSubmitted ? 'Update Solution' : 'Submit Solution'}
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

      {/* Submission Modal */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {selectedAssignment.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Due Date: {new Date(selectedAssignment.dueDate).toLocaleDateString('en-IN')} • Max: {selectedAssignment.totalMarks} Marks
                </p>
              </div>
              <button onClick={() => setSubmitModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedAssignment.questions && selectedAssignment.questions.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-teal-800">Problem Criteria / Requirements:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                  {selectedAssignment.questions.map((q, qIdx) => (
                    <li key={qIdx}>{q.question}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Project Deliverable URL (GitHub Repository / Google Drive / Live Link) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-name/project or https://drive.google.com/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Overview of features / Work summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain key features, libraries used, or notes for the faculty..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-700 px-8 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Upload Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
