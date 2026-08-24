import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Clock,
  Upload,
  FileUp,
  X
} from 'lucide-react';

export default function AcademicsManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'assignments'

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [noteFile, setNoteFile] = useState(null);
  const [uploadingNote, setUploadingNote] = useState(false);

  const fileInputRef = useRef(null);

  const [noteForm, setNoteForm] = useState({
    chapterTitle: 'Chapter 1: Foundations',
    title: '',
    description: '',
    fileUrl: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    instructions: '',
    totalMarks: 100,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
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
      }
    };
    fetchCourses();
  }, []);

  const loadAcademics = async (courseId) => {
    if (!courseId) return;
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
    if (selectedCourseId) {
      loadAcademics(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setUploadingNote(true);

    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourseId);
      formData.append('chapterTitle', noteForm.chapterTitle);
      formData.append('title', noteForm.title);
      formData.append('description', noteForm.description);

      if (noteFile) {
        formData.append('file', noteFile);
      } else if (noteForm.fileUrl) {
        formData.append('fileUrl', noteForm.fileUrl);
      } else {
        alert('Please choose a PDF file or enter file URL');
        setUploadingNote(false);
        return;
      }

      const token = localStorage.getItem('fti_token');
      const response = await fetch('http://localhost:5000/api/academics/notes', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Note upload failed');
      }

      setNoteModalOpen(false);
      setNoteFile(null);
      setNoteForm({ chapterTitle: 'Chapter 1: Foundations', title: '', description: '', fileUrl: '' });
      loadAcademics(selectedCourseId);
    } catch (err) {
      alert(err.message || 'Error uploading note');
    } finally {
      setUploadingNote(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/academics/assignments', 'POST', {
        ...assignmentForm,
        courseId: selectedCourseId
      });
      if (res.success) {
        setAssignmentModalOpen(false);
        loadAcademics(selectedCourseId);
      }
    } catch (err) {
      alert(err.message || 'Error creating assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Study Notes & Practical Tasks
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Course-level academic resources, PDF handouts, and student assignment tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0b3c68] shadow-sm"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {activeTab === 'notes' ? (
            <button
              onClick={() => setNoteModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a]"
            >
              <Plus className="h-4 w-4" /> + Upload Study Notes (PDF)
            </button>
          ) : (
            <button
              onClick={() => setAssignmentModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-800"
            >
              <Plus className="h-4 w-4" /> + Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'notes' ? 'bg-[#0b3c68] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-4 w-4" /> Course Study Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'assignments' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" /> Practical Assignments ({assignments.length})
        </button>
      </div>

      {/* NOTES LIST */}
      {activeTab === 'notes' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
              No study notes uploaded for this course. Click "+ Upload Study Notes" to add PDFs.
            </div>
          ) : (
            notes.map((note) => {
              const fileLink = note.fileUrl.startsWith('http') ? note.fileUrl : `http://localhost:5000${note.fileUrl}`;
              return (
                <div
                  key={note._id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#0b3c68]">
                        {note.chapterTitle}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{note.fileSize}</span>
                    </div>
                    <h4 className="mt-2 font-display text-sm font-bold text-slate-900">{note.title}</h4>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {note.description || 'Downloadable chapter documentation & reference materials.'}
                    </p>
                  </div>
                  <a
                    href={fileLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-xs font-bold text-[#0b3c68] hover:bg-[#0b3c68] hover:text-white transition"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF Handout
                  </a>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ASSIGNMENTS LIST */}
      {activeTab === 'assignments' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
              No assignments assigned for this course. Click "+ Create Assignment" to set up tasks.
            </div>
          ) : (
            assignments.map((ass) => (
              <div
                key={ass._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    Max Marks: {ass.totalMarks}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Due: {new Date(ass.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-slate-900">{ass.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {ass.instructions}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Note Modal with PDF file input */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Upload Course Study Note</h3>
              <button onClick={() => setNoteModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Chapter Name *</label>
                <input
                  type="text"
                  required
                  value={noteForm.chapterTitle}
                  onChange={(e) => setNoteForm({ ...noteForm, chapterTitle: e.target.value })}
                  placeholder="e.g. Chapter 1: HTML & CSS Core"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Document Title *</label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Complete Syllabus Cheat-Sheet"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>

              {/* Upload PDF File */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <label className="block text-slate-700 font-bold uppercase text-[10px]">Upload PDF Document</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm hover:bg-slate-100"
                  >
                    <FileUp className="h-4 w-4" /> {noteFile ? noteFile.name : 'Choose PDF File'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf, .doc, .docx"
                    onChange={(e) => setNoteFile(e.target.files[0])}
                    className="hidden"
                  />
                  {noteFile && <span className="text-[10px] text-emerald-700 font-bold">Selected</span>}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Or PDF File URL</label>
                <input
                  type="url"
                  value={noteForm.fileUrl}
                  onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
                  placeholder="https://example.com/notes.pdf"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNoteModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingNote}
                  className="rounded-xl bg-[#0b3c68] px-5 py-2 text-white font-bold disabled:opacity-40"
                >
                  {uploadingNote ? 'Uploading...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Create Practical Assignment</h3>
              <button onClick={() => setAssignmentModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Task Title *</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="e.g. Responsive Portfolio Website"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Instructions *</label>
                <textarea
                  rows={3}
                  required
                  value={assignmentForm.instructions}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                  placeholder="Requirements, design constraints, deliverables..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Total Marks</label>
                  <input
                    type="number"
                    value={assignmentForm.totalMarks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Submission Deadline</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssignmentModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-700 px-5 py-2 text-white font-bold">
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
