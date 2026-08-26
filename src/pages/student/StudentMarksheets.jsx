import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Printer,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function StudentMarksheets() {
  const [marksheets, setMarksheets] = useState([]);
  const [selectedMs, setSelectedMs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMs = async () => {
      try {
        const res = await apiRequest('/marksheets');
        if (res.success) setMarksheets(res.marksheets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">My Marksheets</h1>
        <p className="text-xs text-slate-500 font-medium">View and download your academic marksheets.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">Loading...</div>
      ) : marksheets.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
          No marksheets available yet. Complete your assessments to receive your marksheet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {marksheets.map((ms) => (
            <div
              key={ms._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {ms.marksheetNo}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                  ms.percentage >= 33 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                }`}>
                  {ms.grade} ({ms.percentage}%)
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{ms.courseName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {ms.status === 'Published' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Published
                    </span>
                  )}
                  {ms.status === 'Draft' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Marks summary */}
              {ms.sections && ms.sections.length > 0 && (
                <div className="space-y-1.5">
                  {ms.sections.map((sec, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium truncate mr-2">{sec.name}</span>
                      <span className="font-bold text-slate-700 whitespace-nowrap">
                        {sec.obtainedMarks}/{sec.maxMarks}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {ms.issuedDate ? new Date(ms.issuedDate).toLocaleDateString('en-IN') : '—'}
                </span>
                <button
                  onClick={() => setSelectedMs(ms)}
                  className="inline-flex items-center gap-1 font-bold text-[#0b3c68] underline hover:text-[#12518a]"
                >
                  <Printer className="h-3 w-3" /> View & Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== Marksheet Preview Modal ========== */}
      {selectedMs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6">
            <div className="rounded-xl sm:rounded-2xl border-4 sm:border-8 border-amber-600/30 bg-gradient-to-b from-amber-50/60 to-white p-4 sm:p-8 text-center space-y-3 sm:space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center text-center sm:text-left gap-2">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-[#0b3c68] tracking-wider">FTI MUMBAI</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Future Technology Institute</p>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Marksheet No</span>
                  <span className="font-mono text-xs font-bold text-[#0b3c68]">{selectedMs.marksheetNo}</span>
                </div>
              </div>

              <div className="py-2">
                <p className="text-[10px] sm:text-xs uppercase font-semibold text-slate-400 tracking-widest">Official Academic Marksheet</p>
              </div>

              {/* Student & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left border-y border-slate-200 py-3 sm:py-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Student Name</span>
                  <p className="text-sm font-bold text-slate-900">{selectedMs.studentName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Course</span>
                  <p className="text-sm font-bold text-[#0b3c68]">{selectedMs.courseName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Enrollment No</span>
                  <p className="text-xs font-bold text-slate-700">{selectedMs.studentId?.enrollmentNo || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Course Code</span>
                  <p className="text-xs font-bold text-slate-700">{selectedMs.courseCode || '—'}</p>
                </div>
              </div>

              {/* Marks Table */}
              {selectedMs.sections && selectedMs.sections.length > 0 && (
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
                      {selectedMs.sections.map((sec, idx) => (
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
                        <td className="px-2 sm:px-3 py-2 text-center font-black text-[#0b3c68]">{selectedMs.totalMaxMarks}</td>
                        <td className="px-2 sm:px-3 py-2 text-center font-black text-[#0b3c68]">{selectedMs.totalObtained}</td>
                        <td className="px-2 sm:px-3 py-2 font-bold text-[#0b3c68] hidden sm:table-cell">{selectedMs.percentage}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Grade Box */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-2">
                <div className="text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Percentage</span>
                  <p className="text-xl sm:text-2xl font-black text-[#0b3c68]">{selectedMs.percentage}%</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Grade</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700">{selectedMs.grade}</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Result</span>
                  <p className={`text-base sm:text-lg font-black ${
                    selectedMs.percentage >= 33 ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {selectedMs.percentage >= 33 ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {selectedMs.remarks && (
                <div className="text-left bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Remarks</span>
                  <p className="text-xs text-slate-700 mt-0.5">{selectedMs.remarks}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 border-t border-slate-200 pt-3 sm:pt-4 text-xs">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-slate-400">Issue Date</p>
                  <p className="font-bold text-slate-700">{selectedMs.issuedDate ? new Date(selectedMs.issuedDate).toLocaleDateString('en-IN') : '—'}</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 w-32 mx-auto" />
                  <p className="mt-1 text-[10px] font-bold text-slate-500">Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setSelectedMs(null)} className="rounded-xl border border-slate-300 px-4 sm:px-5 py-2 text-xs font-bold text-slate-600">Close</button>
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
