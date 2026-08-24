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
  Play
} from 'lucide-react';

export default function StudentExams() {
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [examResult, setExamResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const cRes = await apiRequest('/courses');
        if (cRes.success && cRes.courses.length > 0) {
          setCourses(cRes.courses);
          const sRes = await apiRequest(`/exams/schedules/${cRes.courses[0]._id}`);
          if (sRes.success) setSchedules(sRes.schedules || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleStartExam = (schedule) => {
    setActiveExam(schedule);
    setAnswers({});
    setCurrentQIndex(0);
    setExamResult(null);
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    if (!window.confirm('Are you sure you want to finish and submit your exam?')) return;

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
        setExamResult(res.result);
      }
    } catch (err) {
      alert(err.message || 'Error submitting exam');
    } finally {
      setSubmitting(false);
    }
  };

  // Scorecard Result Screen
  if (examResult) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-6">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${
          examResult.status === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          <Award className="h-10 w-10" />
        </div>

        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase ${
            examResult.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            Exam Status: {examResult.status}
          </span>
          <h2 className="mt-3 font-display text-3xl font-black text-slate-900">
            {examResult.percentage}% Score
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-semibold">Grade Awarded: {examResult.grade}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-xs font-bold">
          <div>
            <span className="text-slate-400 block text-[10px]">Correct</span>
            <span className="text-emerald-700 text-base">{examResult.correctAnswers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Wrong</span>
            <span className="text-red-600 text-base">{examResult.wrongAnswers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Marks</span>
            <span className="text-slate-900 text-base">{examResult.score} / {examResult.totalQuestions}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveExam(null);
            setExamResult(null);
          }}
          className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#12518a]"
        >
          Return to Assessments Table
        </button>
      </div>
    );
  }

  // Active MCQ Exam Interface
  if (activeExam && activeExam.questions?.length > 0) {
    const question = activeExam.questions[currentQIndex];
    const totalQ = activeExam.questions.length;
    const selectedOpt = answers[question._id];

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Exam Header */}
        <div className="flex items-center justify-between rounded-2xl bg-[#082c4d] p-4 text-white shadow-md">
          <div>
            <span className="text-[10px] font-bold text-sky-300 uppercase">Assessment in Progress</span>
            <h3 className="font-display text-sm font-bold text-white">{activeExam.examTitle}</h3>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
            <Clock className="h-4 w-4 text-amber-300" /> {activeExam.durationMinutes} Min
          </div>
        </div>

        {/* Question Palette */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-[#0b3c68]">
              Question {currentQIndex + 1} of {totalQ}
            </span>
            <span className="text-xs font-bold text-slate-400">{question.topic || 'General'}</span>
          </div>

          <h3 className="font-display text-base font-bold text-slate-900 leading-relaxed">
            {question.questionText}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options?.map((opt, i) => {
              const isSelected = selectedOpt === i;
              return (
                <div
                  key={i}
                  onClick={() => handleSelectOption(question._id, i)}
                  className={`cursor-pointer flex items-center gap-3 rounded-2xl border p-4 transition ${
                    isSelected
                      ? 'border-[#0b3c68] bg-sky-50 text-slate-950 font-bold ring-2 ring-[#0b3c68]/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-800'
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isSelected ? 'bg-[#0b3c68] text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-xs font-medium">{opt.optionText}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(currentQIndex - 1)}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-30"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </button>

            {currentQIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
              >
                Next Question <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow hover:bg-emerald-700"
              >
                {submitting ? 'Calculating Result...' : 'Finish & Submit Exam'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pristine Tabular Assessments Table
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
          Assessments & Online Examination Schedules
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Take course-level Practice Tests and Final Certification Exams with instant scorecards.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">Examination Type & Title</th>
                <th className="py-3.5 px-4">Questions Pool</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Passing Score</th>
                <th className="py-3.5 px-4 text-center">Action / Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading assessments...</span>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No active examinations scheduled for your batch.
                  </td>
                </tr>
              ) : (
                schedules.map((sch, idx) => {
                  const isFinal = sch.examType === 'final_exam' || sch.examType === 'final_mcq';
                  const typeLabel = isFinal ? 'Final Exam' : 'Practice Test';

                  return (
                    <tr key={sch._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase mb-1 ${
                          isFinal
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-indigo-100 text-indigo-950 border border-indigo-200'
                        }`}>
                          {typeLabel}
                        </span>
                        <span className="font-bold text-slate-900 block text-sm">{sch.examTitle}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#0b3c68] border border-sky-200">
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
                        {sch.result ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {sch.result.percentage}% ({sch.result.status})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStartExam(sch)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
                          >
                            <Play className="h-3 w-3 fill-current" /> Start Assessment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
