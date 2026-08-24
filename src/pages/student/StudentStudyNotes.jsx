import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  FileText,
  Download,
  BookOpen,
  Search,
  CheckCircle2,
  Eye,
  X,
  HelpCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Award
} from 'lucide-react';

export default function StudentStudyNotes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Reader state
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePdfTitle, setActivePdfTitle] = useState('');

  // Chapter Quiz state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeNoteForQuiz, setActiveNoteForQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
          const first = res.courses[0];
          setSelectedCourse(first);
          loadNotes(first._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  const loadNotes = async (courseId) => {
    try {
      setLoading(true);
      const res = await apiRequest(`/academics/courses/${courseId}/notes`);
      if (res.success) {
        setNotes(res.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuiz = async (note) => {
    try {
      const res = await apiRequest(`/academics/notes/${note._id}`);
      if (res.success && res.note) {
        setActiveNoteForQuiz(res.note);
        setQuizAnswers({});
        setCurrentQIndex(0);
        setQuizResult(res.userAttempt || null);
        setQuizModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to load note quiz:', e);
    }
  };

  const handleSelectQuizOption = (qId, optionLabel) => {
    setQuizAnswers({
      ...quizAnswers,
      [qId]: optionLabel
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeNoteForQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await apiRequest(`/academics/notes/${activeNoteForQuiz._id}/quiz-submit`, 'POST', {
        answers: quizAnswers
      });
      if (res.success) {
        setQuizResult(res.attempt);
        loadNotes(selectedCourse._id);
      }
    } catch (err) {
      alert(err.message || 'Error submitting practice quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const filtered = notes.filter((n) => {
    const term = searchTerm.toLowerCase();
    return n.title?.toLowerCase().includes(term) || n.chapterTitle?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Study Notes & Chapter Practice Quizzes
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Read chapter documentation online and test your mastery with integrated chapter MCQs.
          </p>
        </div>

        {courses.length > 1 && (
          <select
            value={selectedCourse?._id}
            onChange={(e) => {
              const c = courses.find((crs) => crs._id === e.target.value);
              setSelectedCourse(c);
              loadNotes(c._id);
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

      {/* Search Filter */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by topic or chapter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none shadow-sm"
        />
      </div>

      {/* Pristine Student Notes Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">Chapter / Module</th>
                <th className="py-3.5 px-4">Study Note Title</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4">Practice Quiz Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading study notes...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No study notes available for this course yet.
                  </td>
                </tr>
              ) : (
                filtered.map((note, idx) => {
                  const fileLink = note.fileUrl.startsWith('http')
                    ? note.fileUrl
                    : `http://localhost:5000${note.fileUrl}`;

                  const mcqCount = note.totalQuestions || 0;
                  const attempt = note.userAttempt;

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
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {note.fileSize || 'PDF'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {attempt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Scored {attempt.percentage}%
                          </span>
                        ) : mcqCount > 0 ? (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                            {mcqCount} MCQs Pending
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Read Only</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setActivePdfUrl(fileLink);
                              setActivePdfTitle(note.title);
                            }}
                            className="rounded-xl bg-[#0b3c68] px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Read PDF
                          </button>
                          {mcqCount > 0 && (
                            <button
                              onClick={() => handleOpenQuiz(note)}
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition inline-flex items-center gap-1"
                            >
                              <HelpCircle className="h-3.5 w-3.5" /> {attempt ? 'Retake Quiz' : 'Take Quiz'}
                            </button>
                          )}
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

      {/* Fullscreen PDF Reader Modal */}
      {activePdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#0b3c68]" />
                <h3 className="font-display text-sm font-bold text-slate-900">{activePdfTitle}</h3>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-[#12518a]"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
                <button
                  onClick={() => setActivePdfUrl(null)}
                  className="rounded-full bg-white border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={activePdfUrl}
                title="Study Note Reader"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chapter Practice Quiz Modal */}
      {quizModalOpen && activeNoteForQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0b3c68] uppercase">Chapter Self-Assessment</span>
                <h3 className="font-display text-base font-bold text-slate-900">{activeNoteForQuiz.title}</h3>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quiz Result Scorecard Screen */}
            {quizResult ? (
              <div className="text-center space-y-4 py-4">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                  quizResult.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-slate-900">
                    You Scored {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%)
                  </h3>
                  <p className="text-xs font-bold text-emerald-800 mt-1">Status: {quizResult.status}</p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setQuizResult(null)}
                    className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="rounded-xl bg-[#0b3c68] px-6 py-2 text-xs font-bold text-white hover:bg-[#12518a]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : activeNoteForQuiz.questions && activeNoteForQuiz.questions.length > 0 ? (
              /* Active MCQ Question View */
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">
                    Question {currentQIndex + 1} of {activeNoteForQuiz.questions.length}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                    {activeNoteForQuiz.questions[currentQIndex].question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {activeNoteForQuiz.questions[currentQIndex].options?.map((opt, oIdx) => {
                    const qId = activeNoteForQuiz.questions[currentQIndex]._id;
                    const isSelected = quizAnswers[qId] === opt.label;

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectQuizOption(qId, opt.label)}
                        className={`cursor-pointer flex items-center gap-3 rounded-xl border p-3 text-xs transition ${
                          isSelected
                            ? 'border-[#0b3c68] bg-sky-50 font-bold text-slate-900 ring-2 ring-[#0b3c68]/20 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected ? 'bg-[#0b3c68] text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(currentQIndex - 1)}
                    className="flex items-center gap-1 rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </button>

                  {currentQIndex < activeNoteForQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQIndex(currentQIndex + 1)}
                      className="flex items-center gap-1 rounded-xl bg-[#0b3c68] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
                    >
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submittingQuiz}
                      className="flex items-center gap-1 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-black text-white shadow hover:bg-emerald-700"
                    >
                      {submittingQuiz ? 'Submitting...' : 'Finish & Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No questions attached to this note.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
