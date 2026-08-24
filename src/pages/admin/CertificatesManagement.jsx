import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Award,
  Plus,
  Printer,
  CheckCircle2,
  QrCode,
  Calendar,
  ExternalLink,
  X
} from 'lucide-react';

export default function CertificatesManagement() {
  const [certificates, setCertificates] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const [form, setForm] = useState({
    studentId: '',
    courseId: '',
    grade: 'A+',
    percentage: 88
  });

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
    fetchData();
  }, []);

  const handleGenerateCert = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/certificates/generate', 'POST', form);
      if (res.success) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error generating certificate');
    }
  };

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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow hover:bg-amber-400 transition"
        >
          <Award className="h-4 w-4" /> + Issue New Certificate
        </button>
      </div>

      {/* Certificates Gallery */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
            No certificates issued yet. Click "+ Issue New Certificate" to award a student.
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert._id}
              className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-white p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {cert.certificateNo}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                  Grade: {cert.grade} ({cert.percentage}%)
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Awarded To</span>
                <h3 className="font-display text-base font-bold text-slate-900">{cert.studentName}</h3>
                <p className="text-xs font-semibold text-[#0b3c68] mt-0.5">{cert.courseName}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                </span>
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="font-bold text-[#0b3c68] underline hover:text-[#12518a]"
                >
                  Preview & Print
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Issue Certificate Modal */}
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
                  value={form.studentId}
                  onChange={(e) => {
                    const adm = admissions.find((a) => a.studentId?._id === e.target.value);
                    setForm({
                      ...form,
                      studentId: e.target.value,
                      courseId: adm ? adm.courseId?._id : form.courseId
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="">-- Choose Student --</option>
                  {admissions.map((adm) => (
                    <option key={adm._id} value={adm.studentId?._id}>
                      {adm.studentId?.fullName} ({adm.studentId?.enrollmentNo}) - {adm.courseId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Grade</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px]">Percentage (%)</label>
                  <input
                    type="number"
                    value={form.percentage}
                    onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-amber-500 px-5 py-2 text-slate-950 font-black">
                  Generate Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            {/* Certificate Frame */}
            <div className="rounded-2xl border-8 border-amber-600/30 bg-gradient-to-b from-amber-50/60 to-white p-8 text-center space-y-4 relative">
              <div className="flex justify-between items-center text-left">
                <div>
                  <h2 className="font-display text-2xl font-black text-[#0b3c68] tracking-wider">FTI MUMBAI</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Future Technology Institute</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Certificate No</span>
                  <span className="font-mono text-xs font-bold text-[#0b3c68]">{selectedCert.certificateNo}</span>
                </div>
              </div>

              <div className="py-4">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-widest">This is to proudly certify that</p>
                <h1 className="mt-2 font-display text-3xl font-black text-slate-900 border-b-2 border-amber-500/40 inline-block px-8 pb-1">
                  {selectedCert.studentName}
                </h1>
                <p className="mt-3 text-xs text-slate-600">
                  has successfully completed all prescribed training modules, practicals, and assessments for
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#0b3c68]">
                  {selectedCert.courseName}
                </h3>
                <p className="mt-2 text-xs font-bold text-emerald-800">
                  Awarded Grade: {selectedCert.grade} ({selectedCert.percentage}%)
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-200 pt-4 text-xs">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">Issue Date</p>
                  <p className="font-bold text-slate-700">{new Date(selectedCert.issueDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 w-32 mx-auto"></div>
                  <p className="mt-1 text-[10px] font-bold text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedCert(null)}
                className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-600"
              >
                Close
              </button>
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
