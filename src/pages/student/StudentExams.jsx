import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Play,
  RotateCcw,
  Check,
  X,
  Bookmark,
  FileCheck,
  Eye,
  Lock,
  Send
} from 'lucide-react';

export default function StudentExams() {
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [studentBatch, setStudentBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Exam State
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { questionId: true/false }
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Result & Review Modals
  const [scorecardModal, setScorecardModal] = useState(null); // Result object
  const [reviewSolutionsModal, setReviewSolutionsModal] = useState(null); // Schedule object with solutions
  const [reExamModal, setReExamModal] = useState(null); // Schedule object
  const [reExamReason, setReExamReason] = useState('');
  const [requestingReExam, setRequestingReExam] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSchedules = async () => {
    try {
      const cRes = await apiRequest('/courses');
      if (cRes.success && cRes.courses.length > 0) {
        setCourses(cRes.courses);
        const sRes = await apiRequest(`/exams/schedules/${cRes.courses[0]._id}`);
        if (sRes.success) {
          setSchedules(sRes.schedules || []);
          setStudentBatch(sRes.studentBatch || null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (activeExam && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeExam, timeLeftSeconds]);

  const handleStartExam = (schedule) => {
    // Check if re-exam is required and locked
    if (schedule.result && !schedule.result.reExamAllowed) {
      alert('You have already submitted this exam. Re-attempt is locked.');
      return;
    }

    setActiveExam(schedule);
    setAnswers({});
    setFlaggedQuestions({});
    setCurrentQIndex(0);
    setTimeLeftSeconds((schedule.durationMinutes || 45) * 60);
    setConfirmSubmitModal(false);
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleClearOption = (questionId) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleToggleFlag = (questionId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleAutoSubmitOnTimeout = async () => {
    alert('Time has expired! Submitting your examination answers automatically.');
    await executeSubmission();
  };

  const executeSubmission = async () => {
    if (!activeExam) return;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex
      }));

      const res = await apiRequest('/exams/submit', 'POST', {
        examScheduleId: activeExam._id,
        answers: formattedAnswers
      });

      if (res.success) {
        setScorecardModal({
          ...res.result,
          examTitle: activeExam.examTitle,
          questions: activeExam.questions
        });
        setActiveExam(null);
        fetchSchedules();
      }
    } catch (err) {
      alert(err.message || 'Error submitting examination.');
    } finally {
      setSubmitting(false);
      setConfirmSubmitModal(false);
    }
  };

  const handleRequestReExam = async (e) => {
    e.preventDefault();
    if (!reExamReason.trim() || !reExamModal) return;

    setRequestingReExam(true);
    try {
      const res = await apiRequest('/exams/re-exam/request', 'POST', {
        examScheduleId: reExamModal._id,
        reason: reExamReason.trim()
      });

      if (res.success) {
        setActionMessage('Re-Exam request submitted! Awaiting faculty approval.');
        setReExamModal(null);
        setReExamReason('');
        fetchSchedules();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit re-exam request');
    } finally {
      setRequestingReExam(false);
    }
  };

  // Format MM:SS timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ACTIVE FULL-SCREEN EXAM ENVIRONMENT (MAGMA ENGINE)
  if (activeExam && activeExam.questions?.length > 0) {
    const questionsList = activeExam.questions;
    const currentQ = questionsList[currentQIndex];
    const totalQ = questionsList.length;
    const selectedOpt = answers[currentQ._id];
    const isFlagged = flaggedQuestions[currentQ._id];

    // Summary counts
    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
    const unansweredCount = totalQ - answeredCount;

    return (
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Top Sticky Test Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-2xl bg-[#082c4d] p-4 text-white shadow-lg gap-3">
          <div>
            <span className="rounded bg-sky-400/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-200 uppercase tracking-wider">
              {activeExam.examType === 'final_exam' ? 'Final Certification Examination' : 'Practice Examination'}
            </span>
            <h2 className="mt-1 font-display text-base font-bold text-white">{activeExam.examTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Timer */}
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-mono font-bold shadow-inner ${
              timeLeftSeconds < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-sky-300'
            }`}>
              <Clock className="h-4 w-4" />
              <span>Time Left: {formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => setConfirmSubmitModal(true)}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Main Test Layout (Question Area + Question Palette) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Question Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 min-h-[420px] flex flex-col justify-between">
              <div>
                {/* Question Info Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#0b3c68] px-2.5 py-1 text-xs font-black text-white">
                      Q {currentQIndex + 1} of {totalQ}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {currentQ.topic || 'Subject Core'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    +{activeExam.marksPerQuestion || 1} Mark {activeExam.negativeMarks > 0 && `(-${activeExam.negativeMarks} Neg)`}
                  </span>
                </div>

                {/* Question Text */}
                <div className="mt-4">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {currentQ.questionText}
                  </p>
                </div>

                {/* Options List */}
                <div className="mt-6 space-y-3">
                  {currentQ.options?.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQ._id, oIdx)}
                        className={`cursor-pointer flex items-center gap-3.5 rounded-2xl border p-3.5 transition ${
                          isSelected
                            ? 'border-[#0b3c68] bg-sky-50/70 text-[#0b3c68] font-bold ring-2 ring-[#0b3c68]/20 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                          isSelected ? 'bg-[#0b3c68] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-xs leading-relaxed">{opt.optionText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(currentQ._id)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {isFlagged ? 'Flagged for Review' : 'Mark for Review'}
                  </button>

                  {selectedOpt !== undefined && (
                    <button
                      type="button"
                      onClick={() => handleClearOption(currentQ._id)}
                      className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                    >
                      Clear Choice
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </button>

                  {currentQIndex < totalQ - 1 ? (
                    <button
                      onClick={() => setCurrentQIndex(prev => Math.min(totalQ - 1, prev + 1))}
                      className="flex items-center gap-1 rounded-xl bg-[#0b3c68] px-5 py-2 text-xs font-bold text-white hover:bg-[#12518a] shadow"
                    >
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmSubmitModal(true)}
                      className="flex items-center gap-1 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                    >
                      Finish & Submit <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Magma Question Palette */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900">
                Question Palette
              </h3>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-emerald-500"></span>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-amber-400"></span>
                  <span>Review ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-slate-200"></span>
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-[#0b3c68]"></span>
                  <span>Current</span>
                </div>
              </div>

              {/* Question Number Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {questionsList.map((q, idx) => {
                  const isAns = answers[q._id] !== undefined;
                  const isFlg = flaggedQuestions[q._id];
                  const isCur = currentQIndex === idx;

                  let colorClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                  if (isAns && isFlg) {
                    colorClasses = 'bg-amber-400 text-white font-bold border-amber-500';
                  } else if (isAns) {
                    colorClasses = 'bg-emerald-600 text-white font-bold border-emerald-700';
                  } else if (isFlg) {
                    colorClasses = 'bg-amber-400 text-white font-bold border-amber-500';
                  }

                  if (isCur) {
                    colorClasses += ' ring-2 ring-[#0b3c68] ring-offset-1';
                  }

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-9 w-9 rounded-xl border text-xs font-bold transition flex items-center justify-center ${colorClasses}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setConfirmSubmitModal(true)}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3 text-xs font-bold text-white shadow hover:from-emerald-500 hover:to-emerald-600 transition"
              >
                Submit Examination
              </button>
            </div>
          </div>
        </div>

        {/* Pre-Submission Confirmation Modal */}
        {confirmSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#0b3c68]">
                <FileCheck className="h-8 w-8" />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Ready to Submit Exam?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Once submitted, your responses will be evaluated and your scorecard will be generated immediately.
                </p>
              </div>

              {/* Counters breakdown */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px]">Answered</span>
                  <span className="text-emerald-700 text-base">{answeredCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Under Review</span>
                  <span className="text-amber-600 text-base">{flaggedCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Unanswered</span>
                  <span className="text-slate-600 text-base">{unansweredCount}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Keep Solving
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={executeSubmission}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: SCHEDULES TABLE WITH ATTEMPT LOCK & SCORECARDS
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Online Assessments & Examination Portal
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Take scheduled batch exams, view instant scorecards, and review solutions with faculty notes.
          </p>
        </div>

        {studentBatch && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-900">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <span>Assigned Batch: {studentBatch}</span>
          </div>
        )}
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Assessments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">#</th>
                <th className="py-3.5 px-4">Examination Title</th>
                <th className="py-3.5 px-4">Questions Pool</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Passing Score</th>
                <th className="py-3.5 px-4 text-center">Attempt Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading examinations...</span>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No active examinations scheduled for your batch.
                  </td>
                </tr>
              ) : (
                schedules.map((sch, idx) => {
                  const isFinal = sch.examType === 'final_exam';
                  const hasSubmitted = !!sch.result;
                  const canReTake = sch.result?.reExamAllowed === true;
                  const isPendingReExam = sch.reExamRequest?.status === 'Pending';
                  const timeStatus = sch.timeStatus || 'live';

                  return (
                    <tr key={sch._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold uppercase mb-1 ${
                          isFinal
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-indigo-100 text-indigo-950 border border-indigo-200'
                        }`}>
                          {isFinal ? 'Final Exam' : 'Practice Test'}
                        </span>
                        <span className="font-bold text-slate-900 block text-sm">{sch.examTitle}</span>
                        <span className="text-[10px] text-slate-400">
                          Window: {new Date(sch.effectiveStartDate || sch.startDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })} - {new Date(sch.effectiveEndDate || sch.endDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0b3c68] border border-sky-200">
                          {sch.questions?.length || sch.totalQuestions} MCQs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {sch.durationMinutes} Minutes
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {sch.passingPercentage}% Minimum
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {timeStatus === 'live_reexam' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 animate-pulse">
                            <Play className="h-3 w-3 fill-current" /> Live Now (Re-Exam #{sch.result?.reExamAttemptNumber || 2})
                          </span>
                        ) : timeStatus === 'upcoming_reexam' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800">
                            <Clock className="h-3 w-3" /> Re-Exam on {new Date(sch.effectiveStartDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : hasSubmitted && !canReTake ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
                              sch.result.status === 'Pass'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <CheckCircle2 className="h-3 w-3" />
                              Score: {sch.result.percentage}% ({sch.result.status})
                            </span>
                            <span className="block text-[9px] text-slate-400 font-semibold">
                              Attempt #{sch.result.attemptNumber || 1} (Locked)
                            </span>
                          </div>
                        ) : timeStatus === 'live' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Live Assessment
                          </span>
                        ) : timeStatus === 'upcoming' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800">
                            <Clock className="h-3 w-3" /> Upcoming on {new Date(sch.startDate).toLocaleDateString('en-IN')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                            Window Expired
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasSubmitted && !canReTake ? (
                            <>
                              <button
                                onClick={() => setScorecardModal({ ...sch.result, examTitle: sch.examTitle, questions: sch.questions })}
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                              >
                                <Eye className="h-3.5 w-3.5" /> Scorecard
                              </button>

                              {isPendingReExam ? (
                                <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                                  Re-Exam Pending Review
                                </span>
                              ) : sch.result.status === 'Fail' ? (
                                <button
                                  onClick={() => {
                                    setReExamModal(sch);
                                    setReExamReason('');
                                  }}
                                  className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition"
                                >
                                  <RotateCcw className="h-3 w-3" /> Request Re-Exam
                                </button>
                              ) : null}
                            </>
                          ) : timeStatus === 'upcoming' || timeStatus === 'upcoming_reexam' ? (
                            <button
                              disabled
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed"
                            >
                              <Lock className="h-3 w-3" /> Locked until Start
                            </button>
                          ) : timeStatus === 'expired' ? (
                            <button
                              disabled
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
                            >
                              Expired
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartExam(sch)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              {canReTake ? 'Start Re-Exam' : 'Start Assessment'}
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

      {/* SCORECARD MODAL */}
      {scorecardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl space-y-5 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${
              scorecardModal.status === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              <Award className="h-9 w-9" />
            </div>

            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase ${
                scorecardModal.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {scorecardModal.status === 'Pass' ? 'Assessment Passed' : 'Assessment Failed'}
              </span>
              <h2 className="mt-2 font-display text-2xl font-black text-slate-900">
                {scorecardModal.percentage}% Final Score
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Grade: {scorecardModal.grade} • {scorecardModal.examTitle}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 p-3.5 text-xs font-bold">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Qs</span>
                <span className="text-slate-900 text-base">{scorecardModal.totalQuestions}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Correct</span>
                <span className="text-emerald-700 text-base">{scorecardModal.correctAnswers}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Wrong</span>
                <span className="text-red-600 text-base">{scorecardModal.wrongAnswers}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Marks</span>
                <span className="text-[#0b3c68] text-base">{scorecardModal.score}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setScorecardModal(null)}
                className="w-full rounded-xl bg-[#0b3c68] py-2.5 text-xs font-bold text-white hover:bg-[#12518a]"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST RE-EXAM MODAL */}
      {reExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Request Re-Examination
                </h3>
                <p className="text-[11px] text-slate-400">{reExamModal.examTitle}</p>
              </div>
              <button
                onClick={() => setReExamModal(null)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestReExam} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold mb-1">
                  Reason for Re-Exam Request *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Scored low due to network disconnection / Prepared better now..."
                  value={reExamReason}
                  onChange={(e) => setReExamReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 focus:border-[#0b3c68] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReExamModal(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingReExam || !reExamReason.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {requestingReExam ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
