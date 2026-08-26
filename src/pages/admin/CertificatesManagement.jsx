import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Award,
  Printer,
  X,
  Trash2,
  Send,
  Pencil,
  RefreshCw
} from 'lucide-react';

export default function CertificatesManagement() {
  const [certificates, setCertificates] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [editCert, setEditCert] = useState(null);

  const [formStudentId, setFormStudentId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formGrade, setFormGrade] = useState('A+');
  const [formPercentage, setFormPercentage] = useState(0);
  const [formRemarks, setFormRemarks] = useState('');
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, aRes] = await Promise.all([
        apiRequest('/certificates'),
        apiRequest('/admissions')
      ]);
      if (cRes.success) setCertificates(cRes.certificates || []);
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

  // Unique students map
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

  // Auto-calculate grade/percentage from exam results
  const handleAutoCalc = useCallback(async () => {
    if (!formStudentId || !formCourseId) return;
    setCalcLoading(true);
    try {
      const res = await apiRequest(`/certificates/calculate/${formStudentId}/${formCourseId}`);
      if (res.success) {
        setFormGrade(res.grade || 'F');
        setFormPercentage(res.percentage || 0);
      }
    } catch {
      // no exam data — keep manual defaults
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

  const resetForm = () => {
    setFormStudentId('');
    setFormCourseId('');
    setFormGrade('A+');
    setFormPercentage(0);
    setFormRemarks('');
  };

  const handleGenerateCert = async (e) => {
    e.preventDefault();
    if (!formStudentId || !formCourseId) return;
    setSubmitting(true);
    try {
      const adm = admissions.find((a) => a.studentId?._id === formStudentId && a.courseId?._id === formCourseId);
      const res = await apiRequest('/certificates/generate', 'POST', {
        studentId: formStudentId,
        courseId: formCourseId,
        admissionId: adm?._id || undefined,
        grade: formGrade,
        percentage: Number(formPercentage),
        remarks: formRemarks
      });
      if (res.success) {
        setModalOpen(false);
        resetForm();
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error generating certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (cert) => {
    try {
      const res = await apiRequest(`/certificates/${cert._id}/publish`, 'POST');
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message || 'Error publishing');
    }
  };

  const handleDelete = async (cert) => {
    if (!confirm(`Delete certificate ${cert.certificateNo}?`)) return;
    try {
      const res = await apiRequest(`/certificates/${cert._id}`, 'DELETE');
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message || 'Error deleting');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await apiRequest(`/certificates/${editCert._id}`, 'PUT', {
        grade: editCert.grade,
        percentage: editCert.percentage,
        remarks: editCert.remarks
      });
      if (res.success) { setEditCert(null); fetchData(); }
    } catch (err) {
      alert(err.message || 'Error saving');
    }
  };

  // Filtered + paged
  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.studentName?.toLowerCase().includes(q) ||
      c.courseName?.toLowerCase().includes(q) ||
      c.certificateNo?.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const paged = filtered.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Official Course Certificates & Verification
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Issue certified credentials with dynamic tamper-proof QR verification.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow hover:bg-amber-400 transition"
        >
          <Award className="h-4 w-4" /> + Issue New Certificate
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, course, or certificate no..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm"
      />

      {/* Certificates Gallery */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">Loading...</div>
      ) : paged.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
          {search ? 'No certificates match your search.' : 'No certificates issued yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((cert) => (
              <div
                key={cert._id}
                className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-white p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {cert.certificateNo}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                    cert.status === 'Published' ? 'bg-emerald-100 text-emerald-800'
                    : cert.status === 'Revoked' ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cert.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Awarded To</span>
                  <h3 className="font-display text-base font-bold text-slate-900">{cert.studentName}</h3>
                  <p className="text-xs font-semibold text-[#0b3c68] mt-0.5">{cert.courseName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                    Grade: {cert.grade} ({cert.percentage}%)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100"
                    title="Preview & Print"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditCert({ ...cert })}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {cert.status === 'Draft' && (
                    <button
                      onClick={() => handlePublish(cert)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                      title="Publish"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(cert)}
                    className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 text-xs font-bold">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Prev</button>
              <span className="px-3 py-1.5 text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {/* ========== Issue Certificate Modal ========== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Issue Student Certificate</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full bg-slate-100 p-1 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleGenerateCert} className="space-y-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px]">Select Enrolled Student *</label>
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

              {formStudentId && formCourseId && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Grade & Score</span>
                    {calcLoading && <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Grade</label>
                      <select
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className="mt-0.5 w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                      >
                        <option value="A+">A+ (Outstanding)</option>
                        <option value="A">A (Excellent)</option>
                        <option value="B+">B+ (Very Good)</option>
                        <option value="B">B (Good)</option>
                        <option value="C">C (Average)</option>
                        <option value="D">D (Pass)</option>
                        <option value="F">F (Fail)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Percentage (%)</label>
                      <input
                        type="number"
                        value={formPercentage}
                        onChange={(e) => setFormPercentage(e.target.value)}
                        className="mt-0.5 w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                <button type="submit" disabled={submitting || !formStudentId || !formCourseId} className="rounded-xl bg-amber-500 px-5 py-2 text-slate-950 font-black disabled:opacity-50">
                  {submitting ? 'Generating...' : 'Generate Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== Edit Certificate Modal ========== */}
      {editCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Edit — {editCert.certificateNo}</h3>
              <button onClick={() => setEditCert(null)} className="rounded-full bg-slate-100 p-1 text-slate-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Grade</label>
                  <select
                    value={editCert.grade}
                    onChange={(e) => setEditCert({ ...editCert, grade: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Average)</option>
                    <option value="D">D (Pass)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Percentage (%)</label>
                  <input
                    type="number"
                    value={editCert.percentage}
                    onChange={(e) => setEditCert({ ...editCert, percentage: Number(e.target.value) })}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Remarks</label>
                <input
                  type="text"
                  value={editCert.remarks || ''}
                  onChange={(e) => setEditCert({ ...editCert, remarks: e.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditCert(null)} className="rounded-xl border px-4 py-2">Cancel</button>
                <button onClick={handleSaveEdit} className="rounded-xl bg-[#0b3c68] px-5 py-2 text-white font-bold">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== Certificate Preview Modal ========== */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div className="rounded-2xl border-8 border-amber-600/30 bg-gradient-to-b from-amber-50/60 to-white p-8 text-center space-y-4 relative">
              <div className="flex justify-between items-center text-left">
                <div>
                  <h2 className="font-display text-2xl font-black text-[#0b3c68] tracking-wider">FTI MUMBAI</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Future Technology Institute</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Certificate No</span>
                  <span className="font-mono text-xs font-bold text-[#0b3c68]">{previewCert.certificateNo}</span>
                  <div className="mt-1">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                      previewCert.status === 'Published' ? 'bg-emerald-100 text-emerald-800'
                      : previewCert.status === 'Revoked' ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                    }`}>
                      {previewCert.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-widest">This is to proudly certify that</p>
                <h1 className="mt-2 font-display text-3xl font-black text-slate-900 border-b-2 border-amber-500/40 inline-block px-8 pb-1">
                  {previewCert.studentName}
                </h1>
                <p className="mt-3 text-xs text-slate-600">
                  has successfully completed all prescribed training modules, practicals, and assessments for
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#0b3c68]">
                  {previewCert.courseName}
                </h3>
                <p className="mt-2 text-xs font-bold text-emerald-800">
                  Awarded Grade: {previewCert.grade} ({previewCert.percentage}%)
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-200 pt-4 text-xs">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">Issue Date</p>
                  <p className="font-bold text-slate-700">{previewCert.issueDate ? new Date(previewCert.issueDate).toLocaleDateString('en-IN') : '—'}</p>
                </div>
                {previewCert.publishedDate && (
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400">Published</p>
                    <p className="font-bold text-slate-700">{new Date(previewCert.publishedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                <div>
                  <div className="h-8 border-b border-slate-400 w-32 mx-auto" />
                  <p className="mt-1 text-[10px] font-bold text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setPreviewCert(null)} className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-600">Close</button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a]"
              >
                <Printer className="h-4 w-4" /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
