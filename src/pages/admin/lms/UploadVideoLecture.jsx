import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  FileVideo,
  Upload,
  ArrowLeft,
  CheckCircle2,
  FileUp,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Image as ImageIcon,
  LinkIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emptyForm = {
  courseId: '',
  moduleTitle: 'Module 1: Foundations',
  title: '',
  description: '',
  videoUrl: '',
  videoSource: 'upload',
  isActive: true
};

export default function UploadVideoLecture() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Video source files
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Upload progress (upload phase -> compression phase)
  const [uploadPhase, setUploadPhase] = useState('idle');
  const [uploadPercent, setUploadPercent] = useState(0);

  const [formData, setFormData] = useState(emptyForm);

  // MCQ builder option
  const [mcqMode, setMcqMode] = useState('excel'); // 'excel' | 'manual' | 'none'
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreviewCount, setExcelPreviewCount] = useState(0);
  const [manualQuestions, setManualQuestions] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success && res.courses.length > 0) {
          setCourses(res.courses);
          if (!isEditMode) {
            setFormData((prev) => ({ ...prev, courseId: res.courses[0]._id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [isEditMode]);

  // Edit mode: prefill from detail endpoint
  useEffect(() => {
    if (!isEditMode) return;
    const fetchVideo = async () => {
      try {
        const res = await apiRequest(`/lms/videos/${id}/detail`);
        if (!res.success) throw new Error(res.message || 'Failed to load video lecture');
        const v = res.video;
        const isExternal = v.videoUrl.startsWith('http');

        setCourses((prev) => prev); // course select disabled in edit mode
        setFormData({
          courseId: v.courseId,
          moduleTitle: v.moduleTitle,
          title: v.title,
          description: v.description || '',
          videoUrl: isExternal ? v.videoUrl : '',
          videoSource: isExternal ? 'url' : 'upload',
          isActive: v.isActive !== false
        });
        setThumbnailPreview(v.thumbnailUrl ? `${API_BASE.replace(/\/api$/, '')}${v.thumbnailUrl}` : '');

        if (v.questions && v.questions.length > 0) {
          setMcqMode('manual');
          setManualQuestions(
            v.questions.map((q) => ({
              question: q.question,
              options: q.options.map((o) => ({ label: o.label, text: o.text })),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || ''
            }))
          );
        } else {
          setMcqMode('none');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setPageLoading(false);
      }
    };
    fetchVideo();
  }, [isEditMode, id]);

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        setExcelPreviewCount(XLSX.utils.sheet_to_json(ws).length);
      } catch (err) {
        console.error('Error reading excel:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        Question: 'Which CSS property controls the text size?',
        'Option A': 'font-style',
        'Option B': 'font-size',
        'Option C': 'text-size',
        'Option D': 'size',
        'Correct Answer': 'B',
        Explanation: 'font-size sets the size of the text.'
      },
      {
        Question: 'Which HTML tag creates a hyperlink?',
        'Option A': '<a>',
        'Option B': '<link>',
        'Option C': '<href>',
        'Option D': '<url>',
        'Correct Answer': 'A',
        Explanation: 'The <a> tag defines a hyperlink.'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'Video_MCQ_Sample_Template.xlsx');
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

  const updateManualQuestion = (qIdx, updater) => {
    setManualQuestions(manualQuestions.map((q, i) => (i === qIdx ? updater({ ...q }) : q)));
  };

  const removeManualQuestion = (index) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!formData.courseId || !formData.moduleTitle || !formData.title) {
      return 'Please fill in all mandatory fields.';
    }
    if (!isEditMode && formData.videoSource === 'upload' && !videoFile) {
      return 'Please select a video file to upload.';
    }
    if (!isEditMode && formData.videoSource === 'url' && !formData.videoUrl.trim()) {
      return 'Please enter an external video URL.';
    }
    return '';
  };

  // Multipart request via XHR for real upload progress
  const submitFormData = (url, method, body) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      const token = localStorage.getItem('fti_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadPercent(pct);
          if (pct >= 100) setUploadPhase('compressing');
        }
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject(new Error(data.message || 'Video save failed'));
        } catch {
          reject(new Error('Invalid server response'));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(body);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setUploadPhase(formData.videoSource === 'upload' && videoFile ? 'uploading' : 'compressing');
    setUploadPercent(0);
    setError('');

    try {
      const data = new FormData();
      if (!isEditMode) data.append('courseId', formData.courseId);
      data.append('moduleTitle', formData.moduleTitle);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('isActive', String(formData.isActive));

      if (formData.videoSource === 'upload') {
        if (videoFile) data.append('video', videoFile);
      } else {
        data.append('videoUrl', formData.videoUrl.trim());
      }

      if (thumbnailFile) data.append('thumbnail', thumbnailFile);

      // Attach practice MCQs based on selected mode
      if (mcqMode === 'excel' && excelFile) {
        data.append('excelFile', excelFile);
      } else if (mcqMode === 'manual') {
        data.append('manualQuestions', JSON.stringify(manualQuestions));
      } else if (mcqMode === 'none') {
        data.append('clearQuestions', 'true');
      }

      const res = isEditMode
        ? await submitFormData(`${API_BASE}/lms/videos/${id}`, 'PUT', data)
        : await submitFormData(`${API_BASE}/lms/videos`, 'POST', data);

      setSuccess(res.message || 'Video lecture saved successfully! Redirecting...');
      setTimeout(() => navigate('/admin/lms'), 1500);
    } catch (err) {
      setError(err.message || 'Error saving video lecture');
    } finally {
      setLoading(false);
      setUploadPhase('idle');
      setUploadPercent(0);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/lms"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to LMS Table
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#0b3c68]">
            <FileVideo className="h-3.5 w-3.5" /> Video Lecture Studio {isEditMode ? '— Editing Lecture' : ''}
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">
            {isEditMode ? 'Edit Video Lecture & Practice MCQs' : 'Upload Video Lecture with Practice MCQs'}
          </h1>
          <p className="text-xs text-slate-500">
            Upload the lecture video (auto-compressed to H.264 for streaming) and attach self-assessment MCQs via Excel or manually.
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
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-700">
          {/* SECTION 1: COURSE & LECTURE INFO */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">
              Step 1: Lecture Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Target Course *</label>
                <select
                  required
                  disabled={isEditMode}
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-[#0b3c68] disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Module / Chapter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1: HTML5 & Architecture"
                  value={formData.moduleTitle}
                  onChange={(e) => setFormData({ ...formData, moduleTitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Lecture Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Semantic Tags & Box Model — Full Walkthrough"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Description</label>
              <textarea
                rows={2}
                placeholder="Short summary students will see under the player..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 bg-white resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: VIDEO SOURCE */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">
              Step 2: Video Source {isEditMode ? '(leave untouched to keep current)' : ''}
            </h3>

            {/* Source Toggle */}
            {!isEditMode || !formData.videoSource ? null : null}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, videoSource: 'upload' })}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  formData.videoSource === 'upload'
                    ? 'border-[#0b3c68] bg-sky-50 text-[#0b3c68]'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                <Upload className="h-4 w-4" /> Upload Video File
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, videoSource: 'url' })}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  formData.videoSource === 'url'
                    ? 'border-[#0b3c68] bg-sky-50 text-[#0b3c68]'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                <LinkIcon className="h-4 w-4" /> External Video URL
              </button>
            </div>

            {formData.videoSource === 'upload' ? (
              <div className="space-y-2">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center space-y-2">
                  <FileUp className="h-10 w-10 mx-auto text-[#0b3c68]/80" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {videoFile ? `${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(1)} MB)` : 'Choose Video File'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      .mp4, .mkv, .webm, .mov — auto-compressed on upload (Max 350MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => {
                      setVideoFile(e.target.files[0] || null);
                      setError('');
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="mt-2 rounded-xl bg-slate-100 border border-slate-300 px-5 py-2 text-xs font-bold text-[#0b3c68] shadow-sm hover:bg-slate-200"
                  >
                    Browse Video File
                  </button>
                </div>
                {isEditMode && !videoFile && (
                  <p className="text-[10px] text-slate-400 italic text-center">
                    Leave empty to keep the current uploaded video.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="url"
                  required={!isEditMode}
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="YouTube URL, Vimeo URL, S3 URL, or direct link"
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono bg-white"
                />
                {isEditMode && (
                  <p className="text-[10px] text-slate-400 italic">
                    Saving switches this lecture to the entered URL and removes any stored file.
                  </p>
                )}
              </div>
            )}

            {/* Thumbnail */}
            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold mb-1.5">Thumbnail (Optional)</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-white">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="rounded-xl bg-sky-50 border border-sky-200 px-3.5 py-2 text-[11px] font-bold text-[#0b3c68] hover:bg-sky-100 transition"
                  >
                    {thumbnailFile ? 'Change Thumbnail' : 'Upload Thumbnail'}
                  </button>
                  {(thumbnailFile || thumbnailPreview) && (
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview('');
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                      }}
                      className="block text-[10px] font-semibold text-red-500 underline"
                    >
                      Remove selection
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Visibility */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <span className="text-xs font-bold text-slate-600">Visible to students</span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative h-5 w-10 rounded-full transition ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${formData.isActive ? 'left-5' : 'left-0.5'}`}></span>
              </button>
            </label>
          </div>

          {/* SECTION 3: ATTACH VIDEO PRACTICE MCQS */}
          <div className="space-y-4 rounded-2xl bg-emerald-50/50 p-5 border border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" /> Step 3: Attach Video Practice MCQs (Optional)
                </h3>
                <p className="text-[11px] text-slate-500">Students unlock an interactive quiz after watching this lecture.</p>
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
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'excel', label: 'Upload Excel Sheet (.xlsx)' },
                { key: 'manual', label: `Type MCQs Manually${manualQuestions.length ? ` (${manualQuestions.length})` : ''}` },
                { key: 'none', label: isEditMode ? 'Remove MCQs' : 'Skip MCQs' }
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMcqMode(m.key)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                    mcqMode === m.key
                      ? m.key === 'none' ? 'bg-slate-700 text-white shadow' : 'bg-emerald-700 text-white shadow'
                      : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
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
                      onChange={(e) => updateManualQuestion(qIdx, (nq) => ({ ...nq, question: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctAnswer === opt.label}
                            onChange={() => updateManualQuestion(qIdx, (nq) => ({ ...nq, correctAnswer: opt.label }))}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${opt.label}`}
                            value={opt.text}
                            onChange={(e) =>
                              updateManualQuestion(qIdx, (nq) => ({
                                ...nq,
                                options: nq.options.map((o, oi) => (oi === oIdx ? { ...o, text: e.target.value } : o))
                              }))
                            }
                            className="flex-1 rounded-xl border border-slate-300 p-2 text-xs bg-white"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Explanation (optional) — shown after answering"
                      value={q.explanation}
                      onChange={(e) => updateManualQuestion(qIdx, (nq) => ({ ...nq, explanation: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 p-2 text-[11px] bg-white"
                    />
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

            {mcqMode === 'none' && (
              <p className="rounded-xl bg-white border border-slate-200 p-3 text-[11px] italic text-slate-500">
                {isEditMode
                  ? 'Saving will remove all attached MCQs from this video.'
                  : 'No practice quiz will be attached — students can watch without a quiz.'}
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {uploadPhase !== 'idle' && (
            <div className="space-y-1.5 rounded-xl border border-sky-100 bg-sky-50 p-4">
              <div className="flex justify-between text-[11px] font-bold text-[#0b3c68]">
                <span>
                  {uploadPhase === 'uploading'
                    ? `Uploading video... ${uploadPercent}%`
                    : 'Compressing video on server (H.264)...'}
                </span>
                <span>{uploadPhase === 'uploading' ? `${uploadPercent}%` : 'Please wait'}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sky-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    uploadPhase === 'uploading' ? 'bg-[#0b3c68]' : 'bg-emerald-500 animate-pulse'
                  }`}
                  style={{ width: uploadPhase === 'uploading' ? `${uploadPercent}%` : '100%' }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/lms')}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#12518a] disabled:opacity-40"
            >
              {loading
                ? uploadPhase === 'uploading'
                  ? `Uploading ${uploadPercent}%...`
                  : 'Compressing...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish Video Lecture & Quiz'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
