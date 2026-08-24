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
  Sparkles,
  Users,
  RotateCcw,
  UserCheck,
  Check,
  AlertCircle,
  Lock,
  Play
} from 'lucide-react';

export default function ExamManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [reExamRequests, setReExamRequests] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'schedules' | 're_exams'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  // Single Question Modal
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

  // Magma Re-Exam Scheduling Modal
  const [reExamModalData, setReExamModalData] = useState(null); // { student, schedule, result }
  const [reExamForm, setReExamForm] = useState({
    reExamStartDate: new Date().toISOString().slice(0, 16),
    reExamEndDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
    reExamFee: 0,
    reExamRemarks: 'Re-Exam approved by Faculty'
  });
  const [schedulingReExam, setSchedulingReExam] = useState(false);
  const [reExamError, setReExamError] = useState('');

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
      const [qRes, sRes, rRes] = await Promise.all([
        apiRequest(`/exams/questions/${courseId || 'All'}`),
        apiRequest(`/exams/schedules/${courseId || 'All'}`),
        apiRequest('/exams/re-exam/requests')
      ]);
      if (qRes.success) setQuestions(qRes.questions || []);
      if (sRes.success) setSchedules(sRes.schedules || []);
      if (rRes.success) {
        setReExamRequests(rRes.requests || []);
        setAllResults(rRes.results || []);
      }
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
        courseId: selectedCourseId === 'All' ? courses[0]?._id : selectedCourseId
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

  const openScheduleReExamModal = (item) => {
    setReExamModalData(item);
    const now = new Date();
    const end = new Date(Date.now() + 3 * 86400000);
    setReExamForm({
      reExamStartDate: now.toISOString().slice(0, 16),
      reExamEndDate: end.toISOString().slice(0, 16),
      reExamFee: 0,
      reExamRemarks: 'Re-Exam scheduled for knowledge improvement'
    });
    setReExamError('');
  };

  const handleScheduleReExamSubmit = async (e) => {
    e.preventDefault();
    if (!reExamModalData) return;

    if (!reExamForm.reExamStartDate || !reExamForm.reExamEndDate) {
      setReExamError('Start Date and End Date are mandatory');
      return;
    }

    if (new Date(reExamForm.reExamEndDate) <= new Date(reExamForm.reExamStartDate)) {
      setReExamError('End Date must be after Start Date');
      return;
    }

    setSchedulingReExam(true);
    setReExamError('');

    try {
      const payload = {
        examScheduleId: reExamModalData.examScheduleId?._id || reExamModalData.examScheduleId,
        studentId: reExamModalData.studentId?._id || reExamModalData.studentId,
        ...reExamForm
      };

      const res = await apiRequest('/exams/re-exam/schedule', 'POST', payload);
      if (res.success) {
        setActionSuccess(res.message || 'Re-Exam scheduled successfully!');
        setReExamModalData(null);
        loadExamData(selectedCourseId);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setReExamError(err.message || 'Failed to schedule re-exam');
    } finally {
      setSchedulingReExam(false);
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

  const pendingRequestsCount = reExamRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Online Examination & Question Bank Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage course MCQs with Excel import, schedule batch exams, and schedule student re-exams with exact time windows.
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
          ) : activeTab === 'schedules' ? (
            <Link
              to="/admin/exams/schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow hover:bg-indigo-800 transition"
            >
              <Plus className="h-4 w-4" /> + Schedule New Exam
            </Link>
          ) : null}
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

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
        <button
          onClick={() => setActiveTab('re_exams')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 're_exams' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="h-4 w-4" /> Results & Re-Exam Schedule Panel ({allResults.length})
          {pendingRequestsCount > 0 && (
            <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {pendingRequestsCount} Re-Exam Requests
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={
            activeTab === 'questions'
              ? 'Search questions by keyword or topic...'
              : activeTab === 'schedules'
              ? 'Search exams by title...'
              : 'Search student results or re-exam applications...'
          }
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
                  <th className="py-3.5 px-4">Target Batch Cohort</th>
                  <th className="py-3.5 px-4">Questions Sampled</th>
                  <th className="py-3.5 px-4">Total Score</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Scheduled Date & Time Window</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-indigo-700 border-t-transparent"></div>
                      <span className="block mt-2 text-[11px]">Loading schedules...</span>
                    </td>
                  </tr>
                ) : filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 italic space-y-2">
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
                    const isFinal = sch.examType === 'final_exam';
                    const typeLabel = isFinal ? 'Final Certification Exam' : 'Normal Practice Exam';
                    const batchLabel = sch.batchId?.batchName
                      ? `${sch.batchId.batchName} (${sch.batchId.timing})`
                      : (sch.batchNameSnapshot || 'All Batches');

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
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-200">
                            <Users className="h-3 w-3 text-slate-500" /> {batchLabel}
                          </span>
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
                          <span className="block font-semibold">
                            {new Date(sch.startDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <span className="text-slate-400">
                            to {new Date(sch.endDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> {sch.status}
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

      {/* TAB 3: RE-EXAM SCHEDULER & STUDENT RESULTS */}
      {activeTab === 're_exams' && (
        <div className="space-y-6">
          {/* Section 1: Pending Student Re-Exam Applications */}
          {pendingRequestsCount > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold text-amber-900 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-600" /> Pending Student Re-Exam Applications ({pendingRequestsCount})
              </h3>

              <div className="overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/50 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-amber-200 bg-amber-100 text-amber-950 uppercase text-[11px] font-bold tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Student Details</th>
                        <th className="py-3 px-4">Examination</th>
                        <th className="py-3 px-4">Previous Score</th>
                        <th className="py-3 px-4">Student's Reason</th>
                        <th className="py-3 px-4 text-right">Faculty Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/60 font-medium text-slate-800">
                      {reExamRequests.filter(r => r.status === 'Pending').map((req, idx) => (
                        <tr key={req._id} className="hover:bg-amber-100/50 transition">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{req.studentId?.fullName}</span>
                            <span className="text-[10px] text-slate-600 font-mono">
                              {req.studentId?.enrollmentNo} • {req.studentId?.mobile}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {req.examScheduleId?.examTitle}
                          </td>
                          <td className="py-3 px-4 font-bold text-red-600">
                            {req.previousPercentage}% ({req.previousScore} Marks)
                          </td>
                          <td className="py-3 px-4 italic text-slate-700 max-w-xs">
                            "{req.reason}"
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => openScheduleReExamModal({
                                studentId: req.studentId,
                                examScheduleId: req.examScheduleId,
                                result: { score: req.previousScore, percentage: req.previousPercentage }
                              })}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
                            >
                              <Calendar className="h-3.5 w-3.5" /> Schedule Re-Exam
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Student Completed Exam Results Register */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" /> Student Examination Results & Re-Exam Controls ({allResults.length})
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Examination</th>
                      <th className="py-3 px-4">Score & %</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4 text-center">Attempt Status</th>
                      <th className="py-3 px-4 text-right">Re-Exam Scheduling</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {allResults.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                          No student submissions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      allResults.map((res, idx) => (
                        <tr key={res._id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{res.studentId?.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{res.studentId?.enrollmentNo}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {res.examScheduleId?.examTitle}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {res.score} Marks ({res.percentage}%)
                          </td>
                          <td className="py-3 px-4 font-bold text-indigo-700">
                            {res.grade}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              res.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {res.status} (Attempt #{res.attemptNumber || 1})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {res.reExamAllowed ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  <Check className="h-3 w-3" /> Re-Exam Active (Attempt #{res.reExamAttemptNumber || 2})
                                </span>
                                <span className="block text-[9px] text-slate-400">
                                  {res.reExamStartDate && new Date(res.reExamStartDate).toLocaleDateString('en-IN')} - {res.reExamEndDate && new Date(res.reExamEndDate).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => openScheduleReExamModal({
                                  studentId: res.studentId,
                                  examScheduleId: res.examScheduleId,
                                  result: res
                                })}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition shadow-sm"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Schedule Re-Exam
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAGMA RE-EXAM SCHEDULER MODAL */}
      {reExamModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Schedule Student Re-Exam
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {reExamModalData.studentId?.fullName} • {reExamModalData.examScheduleId?.examTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReExamModalData(null)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reExamError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reExamError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleReExamSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">
                    Re-Exam Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={reExamForm.reExamStartDate}
                    onChange={(e) => setReExamForm({ ...reExamForm, reExamStartDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">
                    Re-Exam End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={reExamForm.reExamEndDate}
                    onChange={(e) => setReExamForm({ ...reExamForm, reExamEndDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Re-Exam Fine / Retake Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={reExamForm.reExamFee}
                  onChange={(e) => setReExamForm({ ...reExamForm, reExamFee: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900"
                  placeholder="0 for Free Re-Test"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Faculty Remarks / Notice to Student
                </label>
                <textarea
                  rows={2}
                  value={reExamForm.reExamRemarks}
                  onChange={(e) => setReExamForm({ ...reExamForm, reExamRemarks: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReExamModalData(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingReExam}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-50"
                >
                  {schedulingReExam ? 'Scheduling...' : 'Enable & Schedule Re-Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE QUESTION MODAL */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Add MCQ to Question Bank</h3>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Topic / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript Async/Await"
                  value={questionForm.topic}
                  onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type the full question statement..."
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold mb-2">Options (Select Correct)</label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = questionForm.options.map((o, i) => ({
                            ...o,
                            isCorrect: i === oIdx
                          }));
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                          opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </button>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                        value={opt.optionText}
                        onChange={(e) => {
                          const updated = [...questionForm.options];
                          updated[oIdx].optionText = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0b3c68] px-7 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
