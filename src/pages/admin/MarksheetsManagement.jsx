import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Printer,
  X,
  Trash2,
  Send,
  Pencil,
  RefreshCw,
  Award
} from 'lucide-react';

export default function MarksheetsManagement() {
  const [marksheets, setMarksheets] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewMs, setPreviewMs] = useState(null);
  const [editMs, setEditMs] = useState(null);

  // Issue form
  const [formStudentId, setFormStudentId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formSections, setFormSections] = useState([]);
  const [formRemarks, setFormRemarks] = useState('');
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(marksheets.length / 10));
  const filtered = marksheets.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.studentName?.toLowerCase().includes(q) ||
      m.courseName?.toLowerCase().includes(q) ||
      m.marksheetNo?.toLowerCase().includes(q)
    );
  });
  const paged = filtered.slice((page - 1) * 10, page * 10);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        apiRequest('/marksheets'),
        apiRequest('/admissions')
      ]);
      if (mRes.success) setMarksheets(mRes.marksheets || []);
      if (aRes.success) setAdmissions(aRes.admissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchData(); }, 0);
    return () => clearTimeout(t);
  }, []);

  // Unique students from admissions
  const [studentMap, setStudentMap] = useState(new Map());
  useEffect(() => {
    const t = setTimeout(() => {
      const m = new Map();
      admissions.forEach((adm) => {
        if (adm.studentId?._id) {
          if (!m.has(adm.studentId._id)) {
            m.set(adm.studentId._id, { ...adm.studentId, courses: [] });
          }
          m.get(adm.studentId._id).courses.push({ _id: adm.courseId?._id, name: adm.courseId?.name, admissionId: adm._id });
        }
      });
      setStudentMap(m);
    }, 0);
    return () => clearTimeout(t);
  }, [admissions]);

  const selectedStudent = studentMap.get(formStudentId);

  // Auto-calculate sections when student + course selected
  const handleAutoCalc = useCallback(async () => {
    if (!formStudentId || !formCourseId) return;
    setCalcLoading(true);
    try {
      const res = await apiRequest(`/marksheets/calculate/${formStudentId}/${formCourseId}`);
      if (res.success) {
        setFormSections(res.sections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  }, [formStudentId, formCourseId]);

  useEffect(() => {
    if (formStudentId && formCourseId) {
      const t = setTimeout(() => { handleAutoCalc(); }, 0);
      return () => clearTimeout(t);
    }
  }, [formStudentId, formCourseId, handleAutoCalc]);

  // Recalculate totals from sections
  const totals = formSections.reduce(
    (acc, s) => ({
      max: acc.max + (s.maxMarks || 0),
      obtained: acc.obtained + (s.obtainedMarks || 0)
    }),
    { max: 0, obtained: 0 }
  );
  const percentage = totals.max > 0 ? Math.round((totals.obtained / totals.max) * 100) : 0;
  const grade =
    percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B'
    : percentage >= 50 ? 'C' : percentage >= 33 ? 'D' : 'F';

  // Submit new marksheet
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formStudentId || !formCourseId) return;
    setSubmitting(true);
    try {
      const adm = admissions.find((a) => a.studentId?._id === formStudentId && a.courseId?._id === formCourseId);
      const res = await apiRequest('/marksheets/generate', 'POST', {
        studentId: formStudentId,
        courseId: formCourseId,
        admissionId: adm?._id || undefined,
        sections: formSections,
        totalMaxMarks: totals.max,
        totalObtained: totals.obtained,
        percentage,
        grade,
        remarks: formRemarks
      });
      if (res.success) {
        setModalOpen(false);
        resetForm();
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error generating marksheet');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormStudentId('');
    setFormCourseId('');
    setFormSections([]);
    setFormRemarks('');
  };

  // Publish
  const handlePublish = async (ms) => {
    try {
      const res = await apiRequest(`/marksheets/${ms._id}/publish`, 'POST');
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message || 'Error publishing');
    }
  };

  // Delete
  const handleDelete = async (ms) => {
    if (!confirm(`Delete marksheet ${ms.marksheetNo}?`)) return;
    try {
      const res = await apiRequest(`/marksheets/${ms._id}`, 'DELETE');
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  // Edit section inline
  const handleEditSection = (ms) => {
    setEditMs({ ...ms, sections: ms.sections.map((s) => ({ ...s })) });
  };

  const handleEditSectionChange = (idx, field, val) => {
    setEditMs((prev) => {
      const updated = { ...prev, sections: prev.sections.map((s, i) => i === idx ? { ...s, [field]: Number(val) } : s) };
      const totalsNew = updated.sections.reduce((a, s) => ({ max: a.max + (s.maxMarks || 0), obtained: a.obtained + (s.obtainedMarks || 0) }), { max: 0, obtained: 0 });
      updated.totalMaxMarks = totalsNew.max;
      updated.totalObtained = totalsNew.obtained;
      updated.percentage = totalsNew.max > 0 ? Math.round((totalsNew.obtained / totalsNew.max) * 100) : 0;
      const pct = updated.percentage;
      updated.grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 33 ? 'D' : 'F';
      return updated;
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await apiRequest(`/marksheets/${editMs._id}`, 'PUT', {
        sections: editMs.sections,
        totalMaxMarks: editMs.totalMaxMarks,
        totalObtained: editMs.totalObtained,
        percentage: editMs.percentage,
        grade: editMs.grade
      });
      if (res.success) { setEditMs(null); fetchData(); }
    } catch (err) {
      alert(err.message || 'Error saving');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">Marksheets Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Generate, view, and publish official student marksheets with auto-calculated scores.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow hover:bg-amber-400 transition"
        >
          <Award className="h-4 w-4" /> + Generate New Marksheet
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, course, or marksheet no..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">Loading...</div>
      ) : paged.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
          {search ? 'No marksheets match your search.' : 'No marksheets generated yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {paged.map((ms) => (
            <div
              key={ms._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b3c68] text-white font-bold text-[11px]">
                    {ms.marksheetNo?.split('/').pop() || 'MS'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ms.studentName}</h3>
                    <p className="text-[11px] font-semibold text-[#0b3c68]">{ms.courseName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ms.marksheetNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                    ms.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ms.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {ms.grade} ({ms.percentage}%)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {ms.issuedDate ? new Date(ms.issuedDate).toLocaleDateString('en-IN') : ''}
                  </span>
                  <button
                    onClick={() => setPreviewMs(ms)}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100"
                    title="Preview"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleEditSection(ms)}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100"
                    title="Edit marks"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {ms.status === 'Draft' && (
                    <button
                      onClick={() => handlePublish(ms)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                      title="Publish"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(ms)}
                    className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 text-xs font-bold">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Prev</button>
              <span className="px-3 py-1.5 text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {/* ========== Generate New Marksheet Modal ========== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Generate Student Marksheet</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Student */}
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Select Student *</label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => { setFormStudentId(e.target.value); setFormCourseId(''); }}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="">-- Choose Student --</option>
                  {[...studentMap.values()].map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.enrollmentNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course */}
              {selectedStudent && (
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Select Course *</label>
                  <select
                    required
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Choose Course --</option>
                    {selectedStudent.courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Auto-calc sections */}
              {formStudentId && formCourseId && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Score Breakdown</span>
                    {calcLoading && <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />}
                  </div>
                  {formSections.length === 0 && !calcLoading ? (
                    <p className="text-[11px] text-slate-400 italic">
                      No exam/quiz/note data found for this student in this course. You can add sections manually below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formSections.map((sec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex-1 text-[11px] font-bold text-slate-700 truncate">{sec.name}</span>
                          <input
                            type="number"
                            value={sec.maxMarks}
                            onChange={(e) => {
                              const val = [...formSections];
                              val[idx] = { ...val[idx], maxMarks: Number(e.target.value) };
                              setFormSections(val);
                            }}
                            className="w-16 rounded-lg border border-slate-300 p-1.5 text-[11px] text-center"
                            placeholder="Max"
                          />
                          <input
                            type="number"
                            value={sec.obtainedMarks}
                            onChange={(e) => {
                              const val = [...formSections];
                              val[idx] = { ...val[idx], obtainedMarks: Number(e.target.value) };
                              setFormSections(val);
                            }}
                            className="w-16 rounded-lg border border-slate-300 p-1.5 text-[11px] text-center"
                            placeholder="Got"
                          />
                          <span className="text-[10px] text-slate-400 w-20 text-right">{sec.breakdown}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add custom section */}
                  <button
                    type="button"
                    onClick={() => setFormSections([...formSections, { name: 'Custom Section', maxMarks: 100, obtainedMarks: 0, weightage: 0, breakdown: '' }])}
                    className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition"
                  >
                    + Add Section
                  </button>
                </div>
              )}

              {/* Totals */}
              {formSections.length > 0 && (
                <div className="rounded-xl bg-[#0b3c68]/5 border border-[#0b3c68]/20 p-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0b3c68]">
                    Total: {totals.obtained} / {totals.max}
                  </span>
                  <span className={`text-[11px] font-black ${
                    percentage >= 33 ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {percentage}% — Grade: {grade}
                  </span>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Remarks (optional)</label>
                <input
                  type="text"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  placeholder="e.g. Excellent performance"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border px-4 py-2">Cancel</button>
                <button type="submit" disabled={submitting || formSections.length === 0} className="rounded-xl bg-amber-500 px-5 py-2 text-slate-950 font-black disabled:opacity-50">
                  {submitting ? 'Generating...' : 'Generate Marksheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== Edit Marks Modal ========== */}
      {editMs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Edit Marks — {editMs.marksheetNo}</h3>
              <button onClick={() => setEditMs(null)} className="rounded-full bg-slate-100 p-1 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {editMs.sections.map((sec, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700">{sec.name}</span>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400">Max Marks</label>
                      <input type="number" value={sec.maxMarks} onChange={(e) => handleEditSectionChange(idx, 'maxMarks', e.target.value)} className="mt-0.5 w-full rounded-lg border border-slate-300 p-1.5 text-[11px]" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400">Obtained</label>
                      <input type="number" value={sec.obtainedMarks} onChange={(e) => handleEditSectionChange(idx, 'obtainedMarks', e.target.value)} className="mt-0.5 w-full rounded-lg border border-slate-300 p-1.5 text-[11px]" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl bg-[#0b3c68]/5 border border-[#0b3c68]/20 p-3 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#0b3c68]">Total: {editMs.totalObtained} / {editMs.totalMaxMarks}</span>
                <span className="text-[11px] font-black text-[#0b3c68]">{editMs.percentage}% — Grade: {editMs.grade}</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditMs(null)} className="rounded-xl border px-4 py-2">Cancel</button>
                <button onClick={handleSaveEdit} className="rounded-xl bg-[#0b3c68] px-5 py-2 text-white font-bold">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== Preview Marksheet Modal ========== */}
      {previewMs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
            <div className="rounded-xl sm:rounded-2xl border-4 sm:border-8 border-amber-600/30 bg-gradient-to-b from-amber-50/60 to-white p-4 sm:p-8 text-center space-y-3 sm:space-y-4 relative">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center text-center sm:text-left gap-2">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-[#0b3c68] tracking-wider">FTI MUMBAI</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Future Technology Institute</p>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Marksheet No</span>
                  <span className="font-mono text-xs font-bold text-[#0b3c68]">{previewMs.marksheetNo}</span>
                  <div className="mt-1">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                      previewMs.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {previewMs.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="py-2">
                <p className="text-[10px] sm:text-xs uppercase font-semibold text-slate-400 tracking-widest">Official Academic Marksheet</p>
              </div>

              {/* Student & Course Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left border-y border-slate-200 py-3 sm:py-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Student Name</span>
                  <p className="text-sm font-bold text-slate-900">{previewMs.studentName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Course</span>
                  <p className="text-sm font-bold text-[#0b3c68]">{previewMs.courseName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Enrollment No</span>
                  <p className="text-xs font-bold text-slate-700">{previewMs.studentId?.enrollmentNo || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Course Code</span>
                  <p className="text-xs font-bold text-slate-700">{previewMs.courseCode || '—'}</p>
                </div>
              </div>

              {/* Marks Table */}
              {previewMs.sections && previewMs.sections.length > 0 && (
                <div className="text-left overflow-x-auto">
                  <table className="w-full text-[10px] sm:text-[11px]">
                    <thead>
                      <tr className="bg-[#0b3c68] text-white">
                        <th className="rounded-tl-lg px-2 sm:px-3 py-2 text-left font-bold">Component</th>
                        <th className="px-2 sm:px-3 py-2 text-center font-bold">Max</th>
                        <th className="px-2 sm:px-3 py-2 text-center font-bold">Obtained</th>
                        <th className="rounded-tr-lg px-2 sm:px-3 py-2 text-left font-bold hidden sm:table-cell">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewMs.sections.map((sec, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-2 sm:px-3 py-2 font-bold text-slate-800">{sec.name}</td>
                          <td className="px-2 sm:px-3 py-2 text-center font-semibold text-slate-600">{sec.maxMarks}</td>
                          <td className={`px-2 sm:px-3 py-2 text-center font-black ${
                            sec.maxMarks > 0 && (sec.obtainedMarks / sec.maxMarks) >= 0.33 ? 'text-emerald-700' : 'text-red-600'
                          }`}>{sec.obtainedMarks}</td>
                          <td className="px-2 sm:px-3 py-2 text-[10px] text-slate-500 italic hidden sm:table-cell">{sec.breakdown}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#0b3c68]/10 border-t-2 border-[#0b3c68]/30">
                        <td className="px-2 sm:px-3 py-2 font-black text-[#0b3c68]">TOTAL</td>
                        <td className="px-2 sm:px-3 py-2 text-center font-black text-[#0b3c68]">{previewMs.totalMaxMarks}</td>
                        <td className="px-2 sm:px-3 py-2 text-center font-black text-[#0b3c68]">{previewMs.totalObtained}</td>
                        <td className="px-2 sm:px-3 py-2 font-bold text-[#0b3c68] hidden sm:table-cell">{previewMs.percentage}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Grade Box */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-2">
                <div className="text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Percentage</span>
                  <p className="text-xl sm:text-2xl font-black text-[#0b3c68]">{previewMs.percentage}%</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Grade</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700">{previewMs.grade}</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Result</span>
                  <p className={`text-base sm:text-lg font-black ${
                    previewMs.percentage >= 33 ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {previewMs.percentage >= 33 ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {previewMs.remarks && (
                <div className="text-left bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Remarks</span>
                  <p className="text-xs text-slate-700 mt-0.5">{previewMs.remarks}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 border-t border-slate-200 pt-3 sm:pt-4 text-xs">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-slate-400">Issue Date</p>
                  <p className="font-bold text-slate-700">{previewMs.issuedDate ? new Date(previewMs.issuedDate).toLocaleDateString('en-IN') : '—'}</p>
                </div>
                {previewMs.publishedDate && (
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">Published</p>
                    <p className="font-bold text-slate-700">{new Date(previewMs.publishedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                <div>
                  <div className="h-8 border-b border-slate-400 w-32 mx-auto" />
                  <p className="mt-1 text-[10px] font-bold text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button onClick={() => setPreviewMs(null)} className="rounded-xl border border-slate-300 px-4 sm:px-5 py-2 text-xs font-bold text-slate-600">Close</button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-4 sm:px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
              >
                <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print Marksheet</span><span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
