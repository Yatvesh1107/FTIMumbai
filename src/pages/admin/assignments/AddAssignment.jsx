import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileUp,
  Plus,
  Trash2
} from 'lucide-react';

export default function AddAssignment() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pdfInputRef = useRef(null);
  const [materialPdfFile, setMaterialPdfFile] = useState(null);

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    instructions: '',
    totalMarks: 50,
    estimatedHours: 2,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });

  const [questions, setQuestions] = useState([
    { question: 'Build responsive navigation bar with logo and CTA button', correctAnswer: 'HTML5 semantic nav and CSS flexbox' },
    { question: 'Implement hero section with animated callout banner', correctAnswer: 'CSS keyframe animations' }
  ]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
          setFormData(prev => ({ ...prev, courseId: res.courses[0]._id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', correctAnswer: '' }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('courseId', formData.courseId);
      data.append('title', formData.title);
      data.append('instructions', formData.instructions);
      data.append('totalMarks', formData.totalMarks);
      data.append('estimatedHours', formData.estimatedHours);
      data.append('dueDate', formData.dueDate);
      data.append('questions', JSON.stringify(questions));

      if (materialPdfFile) {
        data.append('attachment', materialPdfFile);
      }

      const token = localStorage.getItem('fti_token');
      const response = await fetch('http://localhost:5000/api/academics/assignments', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: data
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || 'Failed to create assignment');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/assignments');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assignments Table
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
            <Clock className="h-3.5 w-3.5" /> Magma-Style Practical Assignment Creator
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">
            Create Practical Project Task
          </h1>
          <p className="text-xs text-slate-500">
            Set up task deliverables, attach reference handout PDF, and add problem questions.
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
            <span>Assignment published successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700">
          {/* STEP 1: ASSIGNMENT INFO */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 1: Task Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Target Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-teal-800"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build an E-Commerce Landing Page"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Task Instructions & Deliverables</label>
              <textarea
                rows={3}
                placeholder="Explain the objectives, layout requirements, deliverables (GitHub URL / Live Demo)..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Total Max Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Estimated Time (Hours)</label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Submission Deadline *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: ATTACH REFERENCE MATERIAL PDF */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 2: Reference Handout / Starter Material (Optional)
            </h3>

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center space-y-2">
              <FileUp className="h-10 w-10 mx-auto text-teal-700" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {materialPdfFile ? materialPdfFile.name : 'Upload Assignment Reference PDF'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {materialPdfFile ? `${(materialPdfFile.size / (1024*1024)).toFixed(2)} MB PDF Selected` : 'Starter pack, design mockups, or requirement sheet (Max 50MB)'}
                </p>
              </div>

              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf"
                onChange={(e) => setMaterialPdfFile(e.target.files[0])}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="mt-2 rounded-xl bg-slate-100 border border-slate-300 px-5 py-2 text-xs font-bold text-teal-800 shadow-sm hover:bg-slate-200"
              >
                Browse Reference File
              </button>
            </div>
          </div>

          {/* STEP 3: QUESTIONS / PROBLEM SET */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Step 3: Specific Problem Questions / Criteria ({questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-white border border-teal-300 rounded-lg px-3 py-1.5 hover:bg-teal-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Problem
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Problem #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Problem task description..."
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].question = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Expected solution criteria / keywords..."
                    value={q.correctAnswer}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].correctAnswer = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-slate-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/assignments')}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-800 disabled:opacity-40"
            >
              {loading ? 'Publishing...' : 'Publish Assignment'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
