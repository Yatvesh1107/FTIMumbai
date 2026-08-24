import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  Clock,
  ArrowLeft,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Award,
  X
} from 'lucide-react';

export default function AssignmentSubmissions() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Grading Modal
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [facultyFeedback, setFacultyFeedback] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/academics/assignments/${id}/submissions`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSubmissions();
  }, [id]);

  const handleOpenGradeModal = (sub) => {
    setSelectedSubmission(sub);
    setObtainedMarks(sub.obtainedMarks !== undefined ? sub.obtainedMarks : '');
    setFacultyFeedback(sub.facultyFeedback || '');
    setGradingModalOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSavingGrade(true);
    try {
      const res = await apiRequest(`/academics/assignments/submissions/${selectedSubmission._id}/grade`, 'POST', {
        obtainedMarks: Number(obtainedMarks),
        facultyFeedback
      });
      if (res.success) {
        setGradingModalOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      alert(err.message || 'Error grading submission');
    } finally {
      setSavingGrade(false);
    }
  };

  const submissions = data?.submissions || [];
  const assignment = data?.assignment;

  const filtered = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    const name = s.studentId?.personalDetails?.fullName?.toLowerCase() || '';
    const enroll = s.studentId?.enrollmentNo?.toLowerCase() || '';
    return name.includes(term) || enroll.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/admin/assignments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Assignments Table
          </Link>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Student Project Submissions & Evaluation
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Task: <strong className="text-teal-800">{assignment?.title || 'Loading...'}</strong> (Max Marks: {assignment?.totalMarks || 100})
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 px-5 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Submissions</span>
            <p className="font-display text-xl font-black text-teal-800">{submissions.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 px-5 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Deadline</span>
            <p className="font-display text-sm font-bold text-amber-700 mt-1">
              {assignment ? new Date(assignment.dueDate).toLocaleDateString('en-IN') : '...'}
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student name or enrollment number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-teal-700 focus:outline-none shadow-sm"
        />
      </div>

      {/* Submissions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Enrollment No</th>
                <th className="py-3.5 px-4">Submitted Project Deliverable</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4">Awarded Score</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-teal-700 border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading submissions...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No student submissions received yet for this task.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, idx) => (
                  <tr key={sub._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sub.studentId?.personalDetails?.fullName || 'Student'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      {sub.studentId?.enrollmentNo || 'FTI-STU'}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={sub.submissionFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline max-w-[200px] truncate"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" /> Open Project Link
                      </a>
                      {sub.submissionNotes && (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{sub.submissionNotes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === 'Graded' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {sub.obtainedMarks} / {assignment?.totalMarks || 100}
                        </span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          Pending Evaluation
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className="rounded-xl bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-800 transition"
                      >
                        {sub.status === 'Graded' ? 'Edit Grade' : 'Grade Task'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Grading Modal */}
      {gradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Grade Student Submission
                </h3>
                <p className="text-[11px] text-slate-400">
                  Student: {selectedSubmission.studentId?.personalDetails?.fullName}
                </p>
              </div>
              <button
                onClick={() => setGradingModalOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Submitted Deliverable</span>
                <a
                  href={selectedSubmission.submissionFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-teal-800 font-bold hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {selectedSubmission.submissionFileUrl}
                </a>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Obtained Marks (Out of {assignment?.totalMarks || 100}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={assignment?.totalMarks || 100}
                  value={obtainedMarks}
                  onChange={(e) => setObtainedMarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Faculty Feedback & Review Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Excellent UI execution and structure. Make sure to optimize images next time..."
                  value={facultyFeedback}
                  onChange={(e) => setFacultyFeedback(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGrade}
                  className="rounded-xl bg-teal-700 px-6 py-2 text-xs font-bold text-white shadow hover:bg-teal-800 disabled:opacity-50"
                >
                  {savingGrade ? 'Saving Grade...' : 'Save & Publish Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
