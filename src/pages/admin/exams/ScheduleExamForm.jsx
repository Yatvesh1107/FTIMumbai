import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  Users,
  UserCheck,
  CheckSquare,
  Square
} from 'lucide-react';

const EXAM_TYPES = [
  { value: 'normal_exam', label: 'Normal Practice Exam', desc: 'Regular course test for self-assessment & knowledge check' },
  { value: 'final_exam', label: 'Final Certification Exam', desc: 'Official graded final accreditation examination' }
];

export default function ScheduleExamForm() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetType, setTargetType] = useState('batch'); // 'batch' | 'individual'

  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    courseId: '',
    batchId: 'All',
    examTitle: 'Final Certification MCQ Examination',
    examType: 'final_exam',
    totalQuestions: 25,
    marksPerQuestion: 2,
    negativeMarks: 0,
    durationMinutes: 45,
    passingPercentage: 50,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    instructions: 'Read all questions carefully. The timer starts automatically once you click Start.'
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
          const first = res.courses[0];
          setFormData(prev => ({ ...prev, courseId: first._id, batchId: 'All' }));
          checkQuestionBank(first._id);
          fetchBatches(first._id);
          fetchTargetStudents(first._id, 'All');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const fetchBatches = async (courseId) => {
    try {
      const res = await apiRequest(`/batches/course/${courseId}`);
      if (res.success && res.batches && res.batches.length > 0) {
        setBatches(res.batches);
        const firstBatchId = res.batches[0]._id;
        setFormData(prev => ({ ...prev, batchId: firstBatchId }));
        fetchTargetStudents(courseId, firstBatchId);
      } else {
        setBatches([]);
        setFormData(prev => ({ ...prev, batchId: '' }));
        fetchTargetStudents(courseId, '');
      }
    } catch (e) {
      console.error('Error fetching batches:', e);
    }
  };

  const fetchTargetStudents = async (courseId, batchId) => {
    try {
      const url = `/exams/target-students?courseId=${courseId}${batchId ? `&batchId=${batchId}` : ''}`;
      const res = await apiRequest(url);
      if (res.success) {
        setStudents(res.students || []);
        setSelectedStudentIds((res.students || []).map(s => s.studentId));
      }
    } catch (e) {
      console.error('Error fetching students for exam:', e);
    }
  };

  const checkQuestionBank = async (courseId) => {
    try {
      const res = await apiRequest(`/exams/questions/${courseId}`);
      if (res.success) {
        setQuestionCount(res.questions?.length || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCourseChange = (courseId) => {
    setFormData(prev => ({ ...prev, courseId }));
    checkQuestionBank(courseId);
    fetchBatches(courseId);
  };

  const handleBatchChange = (batchId) => {
    setFormData(prev => ({ ...prev, batchId }));
    fetchTargetStudents(formData.courseId, batchId);
  };

  const toggleStudentSelect = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.studentId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.examTitle || !formData.endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (questionCount === 0) {
      setError('No questions found in this course Question Bank. Please import or add MCQs first.');
      return;
    }

    if (targetType === 'individual' && selectedStudentIds.length === 0) {
      setError('Please select at least one individual student for this exam.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        targetType,
        targetStudentIds: targetType === 'individual' ? selectedStudentIds : []
      };

      const res = await apiRequest('/exams/schedules', 'POST', payload);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/exams');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Exams & Question Bank Table
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
            <Calendar className="h-3.5 w-3.5" /> Magma Examination Scheduler
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">
            Schedule Online Examination
          </h1>
          <p className="text-xs text-slate-500">
            Configure assessment type, assign to specific batches or individual students, and sample random questions.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Examination scheduled successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700">
          {/* STEP 1: TARGET COURSE & BATCH */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Step 1: Course & Cohort Target
              </h3>
              <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                questionCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                <HelpCircle className="h-3.5 w-3.5" /> {questionCount} MCQs in Course Bank
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">1. Select Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-indigo-900"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">2. Select Batch *</label>
                <select
                  required
                  value={formData.batchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-indigo-900"
                >
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchName} ({b.timing}) [{b.batchCode}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">3. Examination Title *</label>
              <input
                type="text"
                required
                value={formData.examTitle}
                onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                placeholder="e.g. Full Stack Final Certification Examination"
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
              />
            </div>

            {/* Target Audience Mode: Batch vs Individual */}
            <div className="pt-2">
              <label className="block uppercase text-[10px] text-slate-400 font-bold mb-2">4. Target Audience</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setTargetType('batch')}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-center gap-2.5 ${
                    targetType === 'batch'
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold ring-2 ring-indigo-600/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                  }`}
                >
                  <Users className="h-4 w-4 text-indigo-700 shrink-0" />
                  <div>
                    <p className="text-xs">Batch Mode</p>
                    <p className="text-[10px] text-slate-500 font-normal">Assign to selected batch</p>
                  </div>
                </div>

                <div
                  onClick={() => setTargetType('individual')}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-center gap-2.5 ${
                    targetType === 'individual'
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold ring-2 ring-indigo-600/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold'
                  }`}
                >
                  <UserCheck className="h-4 w-4 text-indigo-700 shrink-0" />
                  <div>
                    <p className="text-xs">Individual Students</p>
                    <p className="text-[10px] text-slate-500 font-normal">Select specific students from list</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Students Selection Table */}
            {targetType === 'individual' && (
              <div className="rounded-2xl border border-indigo-200 bg-white p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">
                    Select Students to Assign this Exam:
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllStudents}
                    className="text-xs font-bold text-indigo-700 hover:underline"
                  >
                    {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {students.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No students enrolled in this batch yet.</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border rounded-xl">
                    {students.map((stu) => {
                      const isSelected = selectedStudentIds.includes(stu.studentId);
                      return (
                        <div
                          key={stu.studentId}
                          onClick={() => toggleStudentSelect(stu.studentId)}
                          className={`cursor-pointer flex items-center justify-between p-3 transition ${
                            isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-indigo-700" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-300" />
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900">{stu.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {stu.enrollmentNo} • {stu.batchName}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{stu.mobile}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: EXAM TYPE */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Step 2: Choose Exam Type & Question Sampling
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {EXAM_TYPES.map((type) => (
                <div
                  key={type.value}
                  onClick={() => setFormData({ ...formData, examType: type.value })}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    formData.examType === type.value
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {type.value === 'final_exam' ? <Award className="h-4 w-4 text-amber-600" /> : <Sparkles className="h-4 w-4 text-indigo-600" />}
                    {type.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{type.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-4 pt-2">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">
                  Questions to Randomly Pick
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, questionCount)}
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-indigo-900 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Max pool: {questionCount}</span>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Marks Per Question</label>
                <input
                  type="number"
                  min="1"
                  value={formData.marksPerQuestion}
                  onChange={(e) => setFormData({ ...formData, marksPerQuestion: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Negative Marks</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.negativeMarks}
                  onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-red-600 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Total Max Score</label>
                <div className="mt-1 rounded-xl bg-slate-200/80 p-2.5 text-xs font-bold text-slate-900 text-center">
                  {formData.totalQuestions * formData.marksPerQuestion} Marks
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: TIMING, DATES & PASSING SCORE */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Step 3: Duration, Date Window & Passing Score
            </h3>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Exam Duration (Minutes) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Passing Percentage (%) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="100"
                  value={formData.passingPercentage}
                  onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-emerald-800 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Examination Instructions</label>
              <textarea
                rows={2}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/exams')}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || questionCount === 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-700 px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-800 disabled:opacity-40"
            >
              {loading ? 'Generating Exam...' : 'Publish Examination Schedule'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
