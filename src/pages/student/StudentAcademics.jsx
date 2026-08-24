import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  FileText,
  Download,
  Calendar,
  Upload,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';

export default function StudentAcademics() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

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
      }
    };
    fetchInit();
  }, []);

  const loadAcademics = async (courseId) => {
    try {
      const [nRes, aRes] = await Promise.all([
        apiRequest(`/academics/courses/${courseId}/notes`),
        apiRequest(`/academics/courses/${courseId}/assignments`)
      ]);
      if (nRes.success) setNotes(nRes.notes || []);
      if (aRes.success) setAssignments(aRes.assignments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) loadAcademics(selectedCourseId);
  }, [selectedCourseId]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionUrl) return;

    try {
      const res = await apiRequest(`/academics/assignments/${selectedAssignment._id}/submit`, 'POST', {
        submissionFileUrl: submissionUrl,
        submissionNotes
      });
      if (res.success) {
        setSubmitModalOpen(false);
        setSubmissionUrl('');
        setSubmissionNotes('');
        loadAcademics(selectedCourseId);
      }
    } catch (err) {
      alert(err.message || 'Submission failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
          Study Notes & Practical Tasks
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Download course handouts, cheat sheets, and submit assignments.
        </p>
      </div>

      {/* Study Notes Grid */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#0b3c68]" /> Course Reference Notes
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No notes uploaded yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#0b3c68]">
                  {note.chapterTitle}
                </span>
                <h4 className="font-display text-sm font-bold text-slate-900">{note.title}</h4>
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-xs font-bold text-[#0b3c68] hover:bg-[#0b3c68] hover:text-white transition"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF Handout
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-700" /> Assigned Projects & Practicals
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No active assignments assigned.</p>
          ) : (
            assignments.map((ass) => {
              const isSubmitted = ass.submission?.status === 'Submitted' || ass.submission?.status === 'Graded';

              return (
                <div key={ass._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                      {ass.totalMarks} Marks
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      Due: {new Date(ass.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <h4 className="font-display text-sm font-bold text-slate-900">{ass.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ass.instructions}</p>

                  {isSubmitted ? (
                    <div className="rounded-xl bg-emerald-50 p-2 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Solution Uploaded ({ass.submission.status})
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAssignment(ass);
                        setSubmitModalOpen(true);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-2 text-xs font-bold text-white shadow hover:bg-teal-800 transition"
                    >
                      <Upload className="h-3.5 w-3.5" /> Submit Project File
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Submit Assignment: {selectedAssignment.title}
              </h3>
              <button onClick={() => setSubmitModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Project File Link (Google Drive / GitHub / ZIP URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Notes for Trainer</label>
                <textarea
                  rows={2}
                  placeholder="Additional explanation or comments..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSubmitModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-700 px-5 py-2 text-white font-bold">
                  Submit Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
