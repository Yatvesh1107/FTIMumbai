import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  FileText,
  Upload,
  ArrowLeft,
  CheckCircle2,
  FileUp,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadStudyNotes() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pdfInputRef = useRef(null);
  const excelInputRef = useRef(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreviewCount, setExcelPreviewCount] = useState(0);

  const [formData, setFormData] = useState({
    courseId: '',
    chapterTitle: '',
    title: '',
    description: '',
    fileUrl: '',
    orderIndex: 1
  });

  // Manual MCQ builder option
  const [mcqMode, setMcqMode] = useState('excel'); // 'excel' | 'manual' | 'none'
  const [manualQuestions, setManualQuestions] = useState([]);

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

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF documents are allowed.');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setError('');

    // Preview row count
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        setExcelPreviewCount(data.length);
      } catch (e) {
        console.error('Error reading excel:', e);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        'Question': 'Which HTML tag is used for defining a paragraph?',
        'Option A': '<p>',
        'Option B': '<para>',
        'Option C': '<pg>',
        'Option D': '<text>',
        'Correct Answer': 'A',
        'Explanation': '<p> defines a paragraph element in HTML.'
      },
      {
        'Question': 'Which attribute is used to provide an image path in HTML?',
        'Option A': 'link',
        'Option B': 'src',
        'Option C': 'href',
        'Option D': 'path',
        'Correct Answer': 'B',
        'Explanation': 'src specifies the source location of an image.'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'Study_Note_MCQ_Sample_Template.xlsx');
  };

  const addManualQuestion = () => {
    setManualQuestions([
      ...manualQuestions,
      {
        question: '',
        options: [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' }
        ],
        correctAnswer: 'A',
        explanation: ''
      }
    ]);
  };

  const removeManualQuestion = (index) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.chapterTitle || !formData.title) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (!pdfFile && !formData.fileUrl) {
      setError('Please upload a PDF file or provide a valid PDF link.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('courseId', formData.courseId);
      data.append('chapterTitle', formData.chapterTitle);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('orderIndex', formData.orderIndex);

      if (pdfFile) {
        data.append('pdfFile', pdfFile);
      } else {
        data.append('fileUrl', formData.fileUrl);
      }

      if (mcqMode === 'excel' && excelFile) {
        data.append('excelFile', excelFile);
      } else if (mcqMode === 'manual' && manualQuestions.length > 0) {
        data.append('manualQuestions', JSON.stringify(manualQuestions));
      }

      const token = localStorage.getItem('fti_token');
      const response = await fetch('http://localhost:5000/api/academics/notes', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: data
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || 'Failed to upload study note');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/notes');
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
          to="/admin/notes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Notes Table
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#0b3c68]">
            <FileText className="h-3.5 w-3.5" /> Magma-Style Study Note & Practice Quiz Builder
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">
            Upload Study Note with Attached Practice MCQs
          </h1>
          <p className="text-xs text-slate-500">
            Upload the chapter lecture PDF and attach chapter self-assessment MCQs via Excel.
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
            <span>Study note and practice MCQs published successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700">
          {/* SECTION 1: COURSE & CHAPTER INFO */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">
              Step 1: Chapter Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Target Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-[#0b3c68]"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Chapter / Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: HTML5 & Semantic Elements"
                  value={formData.chapterTitle}
                  onChange={(e) => setFormData({ ...formData, chapterTitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Study Note Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Syllabus Cheat-Sheet & Practical Guide"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* SECTION 2: PDF UPLOAD */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">
              Step 2: Lecture Notes PDF Handout
            </h3>

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center space-y-2">
              <FileUp className="h-10 w-10 mx-auto text-[#0b3c68]/80" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {pdfFile ? pdfFile.name : 'Choose PDF Document'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {pdfFile ? `${(pdfFile.size / (1024*1024)).toFixed(2)} MB PDF Selected` : 'Drag & drop your study material PDF (Max 50MB)'}
                </p>
              </div>

              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="mt-2 rounded-xl bg-slate-100 border border-slate-300 px-5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm hover:bg-slate-200"
              >
                Browse PDF File
              </button>
            </div>
          </div>

          {/* SECTION 3: ATTACH CHAPTER MCQS (EXCEL / MANUAL) */}
          <div className="space-y-4 rounded-2xl bg-emerald-50/50 p-5 border border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" /> Step 3: Attach Chapter Practice MCQs (Optional)
                </h3>
                <p className="text-[11px] text-slate-500">Students can take an interactive practice quiz after reading this PDF.</p>
              </div>

              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg px-3 py-1.5 shadow-sm hover:bg-emerald-50"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" /> Download Sample Excel (.xlsx)
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMcqMode('excel')}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                  mcqMode === 'excel' ? 'bg-emerald-700 text-white shadow' : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Upload Excel Sheet (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setMcqMode('manual')}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                  mcqMode === 'manual' ? 'bg-emerald-700 text-white shadow' : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Type MCQs Manually
              </button>
              <button
                type="button"
                onClick={() => setMcqMode('none')}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                  mcqMode === 'none' ? 'bg-slate-700 text-white shadow' : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Skip MCQs
              </button>
            </div>

            {/* Excel Mode */}
            {mcqMode === 'excel' && (
              <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-6 text-center space-y-2">
                <FileSpreadsheet className="h-10 w-10 mx-auto text-emerald-600" />
                <p className="text-sm font-bold text-slate-800">
                  {excelFile ? `${excelFile.name} (${excelPreviewCount} Questions Loaded)` : 'Select Excel Sheet with Questions'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
                </p>
                <input
                  type="file"
                  ref={excelInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => excelInputRef.current?.click()}
                  className="mt-2 rounded-xl bg-emerald-50 border border-emerald-300 px-5 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100"
                >
                  Browse Excel File
                </button>
              </div>
            )}

            {/* Manual Mode */}
            {mcqMode === 'manual' && (
              <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
                {manualQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Question #{qIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeManualQuestion(qIdx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Type question text..."
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...manualQuestions];
                        updated[qIdx].question = e.target.value;
                        setManualQuestions(updated);
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctAnswer === opt.label}
                            onChange={() => {
                              const updated = [...manualQuestions];
                              updated[qIdx].correctAnswer = opt.label;
                              setManualQuestions(updated);
                            }}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${opt.label}`}
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...manualQuestions];
                              updated[qIdx].options[oIdx].text = e.target.value;
                              setManualQuestions(updated);
                            }}
                            className="flex-1 rounded-xl border border-slate-300 p-2 text-xs bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addManualQuestion}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  <Plus className="h-4 w-4" /> Add Question Manually
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/notes')}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#12518a] disabled:opacity-40"
            >
              {loading ? 'Uploading Note & MCQs...' : 'Publish Study Note & Quiz'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
