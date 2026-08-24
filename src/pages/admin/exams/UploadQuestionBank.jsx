import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  FileSpreadsheet,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadQuestionBank() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [topic, setTopic] = useState('Core Subject');
  const [excelFile, setExcelFile] = useState(null);
  const [parsedPreview, setParsedPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setError('');

    // Read and parse preview client-side
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length > 1) {
          const headers = data[0];
          const rows = data.slice(1, 6); // First 5 preview rows
          setParsedPreview({ headers, rows, totalCount: data.length - 1 });
        }
      } catch (err) {
        console.error('Error previewing excel:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        'Topic': 'HTML5 & Semantics',
        'Question': 'Which HTML5 element is used to specify a header for a document or section?',
        'Option A': '<top>',
        'Option B': '<header>',
        'Option C': '<head>',
        'Option D': '<section-head>',
        'Correct Answer': 'B',
        'Marks': 1,
        'Explanation': '<header> represents introductory content or a set of navigational links in HTML5.'
      },
      {
        'Topic': 'CSS Flexbox & Layout',
        'Question': 'In CSS Flexbox, which property is used to align items along the main axis?',
        'Option A': 'align-items',
        'Option B': 'align-content',
        'Option C': 'justify-content',
        'Option D': 'flex-direction',
        'Correct Answer': 'C',
        'Marks': 1,
        'Explanation': 'justify-content defines the alignment along the main axis.'
      },
      {
        'Topic': 'JavaScript ES6+',
        'Question': 'Which keyword declares a block-scoped variable that cannot be reassigned?',
        'Option A': 'var',
        'Option B': 'let',
        'Option C': 'const',
        'Option D': 'static',
        'Correct Answer': 'C',
        'Marks': 1,
        'Explanation': 'const creates an immutable block-scoped binding in ES6.'
      },
      {
        'Topic': 'JavaScript Asynchronous',
        'Question': 'What does a JavaScript Promise return when an operation succeeds?',
        'Option A': 'reject',
        'Option B': 'resolve',
        'Option C': 'catch',
        'Option D': 'finally',
        'Correct Answer': 'B',
        'Marks': 1,
        'Explanation': 'A Promise transitions to resolved when calling resolve().'
      },
      {
        'Topic': 'React Fundamentals',
        'Question': 'Which React Hook is used to manage mutable local state inside a functional component?',
        'Option A': 'useEffect',
        'Option B': 'useMemo',
        'Option C': 'useState',
        'Option D': 'useCallback',
        'Correct Answer': 'C',
        'Marks': 1,
        'Explanation': 'useState is the primary hook for component state in React.'
      },
      {
        'Topic': 'React Lifecycle',
        'Question': 'When does the cleanup function of a useEffect hook execute?',
        'Option A': 'Before the component unmounts or before re-running the effect',
        'Option B': 'Only once after initial render',
        'Option C': 'When an error occurs in the child component',
        'Option D': 'Immediately on page reload',
        'Correct Answer': 'A',
        'Marks': 1,
        'Explanation': 'Cleanup runs before the component unmounts or before applying the next effect.'
      },
      {
        'Topic': 'Node.js & Express',
        'Question': 'In Express.js, what does the next() function do inside middleware?',
        'Option A': 'Terminates the HTTP request',
        'Option B': 'Passes control to the next middleware function in the stack',
        'Option C': 'Restarts the Node.js server',
        'Option D': 'Sends a JSON response to the client',
        'Correct Answer': 'B',
        'Marks': 1,
        'Explanation': 'next() yields execution to the next middleware handler in the pipeline.'
      },
      {
        'Topic': 'MongoDB & Mongoose',
        'Question': 'Which MongoDB operator is used to perform a partial text match or regex search?',
        'Option A': '$eq',
        'Option B': '$in',
        'Option C': '$regex',
        'Option D': '$exists',
        'Correct Answer': 'C',
        'Marks': 1,
        'Explanation': '$regex provides regular expression capabilities for pattern matching in MongoDB.'
      },
      {
        'Topic': 'REST API Architecture',
        'Question': 'Which HTTP status code signifies that a resource was successfully created?',
        'Option A': '200 OK',
        'Option B': '201 Created',
        'Option C': '204 No Content',
        'Option D': '301 Moved Permanently',
        'Correct Answer': 'B',
        'Marks': 1,
        'Explanation': '201 Created indicates the request has succeeded and led to resource creation.'
      },
      {
        'Topic': 'Web Security',
        'Question': 'What is JSON Web Token (JWT) primarily used for in modern web apps?',
        'Option A': 'Compressing video streams',
        'Option B': 'Database schema migration',
        'Option C': 'Stateless user authentication and authorization',
        'Option D': 'Formatting CSS styles',
        'Correct Answer': 'C',
        'Marks': 1,
        'Explanation': 'JWT is an open standard (RFC 7519) for transmitting secure claims for authentication.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'FTI_MCQ_Question_Bank_Template.xlsx');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !excelFile) {
      setError('Please select a course and choose an Excel (.xlsx) file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('courseId', selectedCourseId);
      formData.append('topic', topic);

      const token = localStorage.getItem('fti_token');
      const response = await fetch('http://localhost:5000/api/exams/questions/upload-excel', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Excel import failed');
      }

      setSuccess(data.message);
      setTimeout(() => {
        navigate('/admin/exams');
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
          to="/admin/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Question Bank
        </Link>

        <button
          onClick={handleDownloadSampleTemplate}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
        >
          <Download className="h-4 w-4 text-emerald-600" /> Download Sample Excel Template (.xlsx)
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Bulk MCQ Importer
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">
            Upload Question Bank from Excel
          </h1>
          <p className="text-xs text-slate-500">
            Import hundreds of MCQs with options, correct answers, and topics in seconds.
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
            <span>{success} Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-slate-700">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Target Course *</label>
              <select
                required
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
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
              <label className="block uppercase text-[10px] text-slate-400 font-bold">Default Topic / Subject</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Core Foundations"
                className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Excel File Dropzone */}
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-8 text-center space-y-3">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {excelFile ? excelFile.name : 'Select Excel Spreadsheet (.xlsx, .xls, .csv)'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Expected Columns: Question, Option A, Option B, Option C, Option D, Correct Answer
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-white border border-slate-300 px-5 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-slate-100"
              >
                Browse Excel File
              </button>
            </div>
          </div>

          {/* Client-Side Parsed Preview Table */}
          {parsedPreview.rows && parsedPreview.rows.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Spreadsheet Preview ({parsedPreview.totalCount} Questions Detected)
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Ready to Import
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      {parsedPreview.headers?.slice(0, 6).map((h, i) => (
                        <th key={i} className="py-2 px-2 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.rows?.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-200/60">
                        {row.slice(0, 6).map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-2 text-slate-700 font-medium truncate max-w-[150px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
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
              disabled={loading || !excelFile}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-40"
            >
              {loading ? 'Importing Questions...' : 'Import to Question Bank'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
