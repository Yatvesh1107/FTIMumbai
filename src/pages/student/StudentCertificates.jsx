import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Award,
  Download,
  Calendar,
  CheckCircle2,
  Printer
} from 'lucide-react';

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await apiRequest('/certificates');
        if (res.success) setCertificates(res.certificates || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
          My Certificates & Credentials
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Download and verify your accredited course completion certificates.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
            No certificates issued yet. Complete all modules and final exam to receive certification.
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert._id}
              className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {cert.certificateNo}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                  Grade: {cert.grade}
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{cert.courseName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Awarded to: {cert.studentName}</p>
              </div>

              <button
                onClick={() => setSelectedCert(cert)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b3c68] py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
              >
                <Printer className="h-3.5 w-3.5" /> View & Print Certificate
              </button>
            </div>
          ))
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div className="rounded-2xl border-8 border-amber-600/30 bg-gradient-to-b from-amber-50/60 to-white p-8 text-center space-y-4">
              <div className="flex justify-between items-center text-left">
                <div>
                  <h2 className="font-display text-2xl font-black text-[#0b3c68]">FTI MUMBAI</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Future Technology Institute</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Certificate No</span>
                  <span className="font-mono text-xs font-bold text-[#0b3c68]">{selectedCert.certificateNo}</span>
                </div>
              </div>

              <div className="py-4">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-widest">This is to certify that</p>
                <h1 className="mt-2 font-display text-3xl font-black text-slate-900 border-b-2 border-amber-500/40 inline-block px-8 pb-1">
                  {selectedCert.studentName}
                </h1>
                <p className="mt-3 text-xs text-slate-600">
                  has successfully passed the comprehensive assessment for
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#0b3c68]">
                  {selectedCert.courseName}
                </h3>
                <p className="mt-2 text-xs font-bold text-emerald-800">
                  Grade: {selectedCert.grade} ({selectedCert.percentage}%)
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-200 pt-4 text-xs">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">Date of Issue</p>
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
