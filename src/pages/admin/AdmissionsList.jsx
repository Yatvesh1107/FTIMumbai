import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Lock,
  CheckCircle,
  Eye,
  FileText,
  X
} from 'lucide-react';

export default function AdmissionsList() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [selectedFeeDoc, setSelectedFeeDoc] = useState(null);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/admissions');
      if (res.success) {
        setAdmissions(res.admissions || []);
      }
    } catch (err) {
      console.error('Error fetching admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleViewDetails = async (admission) => {
    setSelectedAdmission(admission);
    try {
      const res = await apiRequest(`/fees/student/${admission.studentId?._id}`);
      if (res.success) {
        setSelectedFeeDoc(res.feePayment);
      }
    } catch (e) {
      setSelectedFeeDoc(null);
    }
  };

  const filteredAdmissions = admissions.filter((adm) => {
    const student = adm.studentId || {};
    const nameMatch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const mobileMatch = student.mobile?.includes(searchTerm);
    const enrollMatch = student.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const courseMatch = adm.courseId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = nameMatch || mobileMatch || enrollMatch || courseMatch;
    const matchesStatus = statusFilter === 'All' || adm.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Student Admissions Register
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Directory of enrolled students, course allocations, fee status & profiles.
          </p>
        </div>

        <Link
          to="/admin/admissions/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <UserPlus className="h-4 w-4" /> + New Student Admission
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, enrollment no, mobile, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#0b3c68] focus:outline-none"
          >
            <option value="All">All Payment Status</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partial / Installments</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student & Enrollment</th>
                <th className="py-3.5 px-4">Course & Batch</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Agreed Fee</th>
                <th className="py-3.5 px-4">Paid / Balance</th>
                <th className="py-3.5 px-4">Portal Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No students match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((adm) => {
                  const student = adm.studentId || {};
                  const course = adm.courseId || {};
                  const isLocked = student.status === 'locked';

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{student.fullName}</p>
                        <span className="inline-block rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-[#0b3c68]">
                          {student.enrollmentNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 line-clamp-1">{course.name}</p>
                        <p className="text-[10px] text-slate-400">{adm.batchTiming}</p>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="text-slate-700 flex items-center gap-1.5 font-semibold">
                          <Phone className="h-3 w-3 text-slate-400" /> {student.mobile}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{student.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">₹{adm.agreedTotalFee?.toLocaleString('en-IN')}</p>
                        {adm.discountGiven > 0 && (
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Disc: -₹{adm.discountGiven?.toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-emerald-700">Paid: ₹{adm.totalPaid?.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-amber-700 font-semibold">Due: ₹{adm.totalBalance?.toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewDetails(adm)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-[#0b3c68] hover:text-white transition"
                          title="View Full Student Dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Drawer / Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student File</span>
                <h3 className="font-display text-lg font-black text-slate-900">
                  {selectedAdmission.studentId?.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-50 p-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Enrollment No</span>
                <span className="font-bold text-[#0b3c68]">{selectedAdmission.studentId?.enrollmentNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Enrolled Course</span>
                <span className="font-bold text-slate-800">{selectedAdmission.courseId?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Mobile & WhatsApp</span>
                <span className="font-bold text-slate-800">{selectedAdmission.studentId?.mobile}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Batch Timing</span>
                <span className="font-bold text-slate-800">{selectedAdmission.batchTiming}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Guardian</span>
                <span className="font-bold text-slate-800">{selectedAdmission.studentId?.guardianName} ({selectedAdmission.studentId?.guardianRelation})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">ID Proof</span>
                <span className="font-bold text-slate-800">{selectedAdmission.studentId?.idProofType}</span>
              </div>
            </div>

            {/* Installments Ledger */}
            {selectedFeeDoc && (
              <div className="space-y-3">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">
                  Fee Installments Ledger
                </h4>
                <div className="space-y-2">
                  {selectedFeeDoc.installments?.map((inst, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Installment #{inst.installmentNo}</span>
                        <p className="text-[10px] text-slate-400">Due: {new Date(inst.dueDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₹{inst.amount.toLocaleString('en-IN')}</p>
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold capitalize ${
                          inst.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAdmission(null)}
                className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#12518a]"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
