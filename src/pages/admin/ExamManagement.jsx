import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  HelpCircle,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  Download,
  Filter,
  Search,
  X,
  Award,
  Sparkles
} from 'lucide-react';

export default function ExamManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'schedules'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    topic: 'Core Subject',
    questionText: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ],
    explanation: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const loadExamData = async (courseId) => {
    try {
      setLoading(true);
      const [qRes, sRes] = await Promise.all([
        apiRequest(`/exams/questions/${courseId || 'All'}`),
        apiRequest(`/exams/schedules/${courseId || 'All'}`)
      ]);
      if (qRes.success) setQuestions(qRes.questions || []);
      if (sRes.success) setSchedules(sRes.schedules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadExamData(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/exams/questions', 'POST', {
        ...questionForm,
        courseId: selectedCourseId
      });
      if (res.success) {
        setQuestionModalOpen(false);
        setQuestionForm({
          topic: 'Core Subject',
          questionText: '',
          options: [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false }
          ],
          explanation: ''
        });
        loadExamData(selectedCourseId);
      }
    } catch (err) {
      alert(err.message || 'Error creating question');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    return q.questionText?.toLowerCase().includes(term) || q.topic?.toLowerCase().includes(term);
  });

  const filteredSchedules = schedules.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.examTitle?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            MCQ Question Bank & Online Assessment Schedules
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage course MCQs with Excel import, inspect questions pool, and schedule exams with random question selection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              loadExamData(e.target.value);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm"
          >
            <option value="All">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {activeTab === 'questions' ? (
            <>
              <Link
                to="/admin/exams/upload"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Bulk Import Excel (.xlsx)
              </Link>
              <button
                onClick={() => setQuestionModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
              >
                <Plus className="h-4 w-4" /> Add Single MCQ
              </button>
            </>
          ) : (
            <Link
              to="/admin/exams/schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-800 transition"
            >
              <Plus className="h-4 w-4" /> + Schedule New Exam (Magma Engine)
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'questions' ? 'bg-[#0b3c68] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="h-4 w-4" /> Question Bank Table ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'schedules' ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-4 w-4" /> Exam Schedules Table ({schedules.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={activeTab === 'questions' ? 'Search questions by keyword or topic...' : 'Search exams by title...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none shadow-sm"
        />
      </div>

      {/* TAB 1: QUESTIONS TABLE */}
      {activeTab === 'questions' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-14 text-center">#</th>
                  <th className="py-3.5 px-4">Course Name</th>
                  <th className="py-3.5 px-4">Topic / Subject</th>
                  <th className="py-3.5 px-4">Question Text</th>
                  <th className="py-3.5 px-4">Options & Correct Answer</th>
                  <th className="py-3.5 px-4 text-center">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                      <span className="block mt-2 text-[11px]">Loading question bank...</span>
                    </td>
                  </tr>
                ) : filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic space-y-2">
                      <p>No questions in question bank for this course filter.</p>
                      <Link
                        to="/admin/exams/upload"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> Bulk Import from Excel (.xlsx)
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <tr key={q._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[150px] truncate">
                        {q.courseId?.name || 'All Courses'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#0b3c68] border border-sky-100">
                          {q.topic}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-relaxed">{q.questionText}</p>
                        {q.explanation && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Note: {q.explanation}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {q.options?.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className={`rounded-lg px-2 py-1 text-[11px] font-medium border ${
                                opt.isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <strong>{String.fromCharCode(65 + oIdx)}:</strong> {opt.optionText}
                              {opt.isCorrect && ' ✓'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-[10px]">
                          {q.marks || 1} Mark
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULES TABLE */}
      {activeTab === 'schedules' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">#</th>
                  <th className="py-3.5 px-4">Exam Type & Title</th>
                  <th className="py-3.5 px-4">Questions Sampled</th>
                  <th className="py-3.5 px-4">Total Score</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Active Date Window</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-indigo-700 border-t-transparent"></div>
                      <span className="block mt-2 text-[11px]">Loading schedules...</span>
                    </td>
                  </tr>
                ) : filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic space-y-2">
                      <p>No exams scheduled yet for this course.</p>
                      <Link
                        to="/admin/exams/schedule"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Schedule an exam now
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((sch, idx) => {
                    const isFinal = sch.examType === 'final_exam' || sch.examType === 'final_mcq';
                    const typeLabel = isFinal ? 'Final Certification Exam' : 'Normal Practice Exam';

                    return (
                      <tr key={sch._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase mb-1 ${
                            isFinal
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : 'bg-indigo-100 text-indigo-950 border border-indigo-200'
                          }`}>
                            {typeLabel}
                          </span>
                          <span className="font-bold text-slate-900 block">{sch.examTitle}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 border border-indigo-200">
                            {sch.questions?.length || sch.totalQuestions} Random MCQs
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {sch.totalMarks || (sch.totalQuestions * (sch.marksPerQuestion || 1))} Marks
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">
                          {sch.durationMinutes} Minutes
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                          {new Date(sch.startDate).toLocaleDateString('en-IN')} - {new Date(sch.endDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Live
                          </span>
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

      {/* Add Single Question Modal */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Add Single MCQ Question</h3>
              <button onClick={() => setQuestionModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Topic / Subject</label>
                <input
                  type="text"
                  value={questionForm.topic}
                  onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                  placeholder="e.g. CSS Grid"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Question Text *</label>
                <textarea
                  rows={2}
                  required
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="Type MCQ question..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-slate-400 uppercase text-[10px]">Options (Select Correct Answer Radio)</label>
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updated = questionForm.options.map((o, idx) => ({ ...o, isCorrect: idx === i }));
                        setQuestionForm({ ...questionForm, options: updated });
                      }}
                      className="h-4 w-4 text-[#0b3c68]"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt.optionText}
                      onChange={(e) => {
                        const updated = [...questionForm.options];
                        updated[i].optionText = e.target.value;
                        setQuestionForm({ ...questionForm, options: updated });
                      }}
                      className="flex-1 rounded-xl border border-slate-300 p-2 text-xs font-medium"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setQuestionModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-[#0b3c68] px-5 py-2 text-white font-bold">
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
