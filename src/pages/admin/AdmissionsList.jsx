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
  CreditCard,
  Lock,
  CheckCircle,
  Eye,
  X,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function AdmissionsList() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);

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
    setTimeout(() => { fetchAdmissions(); }, 0);
  }, []);

  // Group admissions by student
  const groupedStudents = admissions.reduce((acc, adm) => {
    const studentId = adm.studentId?._id;
    if (!studentId) return acc;

    if (!acc[studentId]) {
      acc[studentId] = {
        student: adm.studentId,
        admissions: [],
        totalFee: 0,
        totalPaid: 0,
        totalBalance: 0,
        courses: [],
        hasLock: false,
        latestAdmission: adm
      };
    }

    const group = acc[studentId];
    group.admissions.push(adm);
    group.totalFee += adm.agreedTotalFee || 0;
    group.totalPaid += adm.totalPaid || 0;
    group.totalBalance += adm.totalBalance || 0;
    group.courses.push({
      name: adm.courseId?.name || 'Unknown',
      batch: adm.batchTiming || '',
      fee: adm.agreedTotalFee || 0,
      paid: adm.totalPaid || 0,
      balance: adm.totalBalance || 0,
      status: adm.paymentStatus,
      admissionNo: adm.admissionNo,
      admissionDate: adm.createdAt
    });
    if (adm.studentId?.status === 'locked') group.hasLock = true;
    if (new Date(adm.createdAt) > new Date(group.latestAdmission.createdAt)) {
      group.latestAdmission = adm;
    }

    return acc;
  }, {});

  const studentList = Object.values(groupedStudents);

  const filteredStudents = studentList.filter((g) => {
    const s = g.student || {};
    const q = searchTerm.toLowerCase();
    const nameMatch = s.fullName?.toLowerCase().includes(q);
    const mobileMatch = s.mobile?.includes(searchTerm);
    const enrollMatch = s.enrollmentNo?.toLowerCase().includes(q);
    const courseMatch = g.courses.some((c) => c.name.toLowerCase().includes(q));
    const matchesSearch = nameMatch || mobileMatch || enrollMatch || courseMatch;

    let matchesStatus = true;
    if (statusFilter === 'locked') {
      matchesStatus = g.hasLock;
    } else if (statusFilter === 'active') {
      matchesStatus = !g.hasLock;
    } else if (statusFilter === 'paid') {
      matchesStatus = g.totalBalance === 0;
    } else if (statusFilter === 'pending') {
      matchesStatus = g.totalBalance > 0;
    }

    return matchesSearch && matchesStatus;
  });

  const handleViewStudent = async (group) => {
    setSelectedStudent(group);
    setLoadingFees(true);
    try {
      const res = await apiRequest(`/fees/student/${group.student._id}`);
      if (res.success && res.feePayment) {
        const fp = Array.isArray(res.feePayment) ? res.feePayment : [res.feePayment];
        setStudentFees(fp);
      } else {
        setStudentFees([]);
      }
    } catch {
      setStudentFees([]);
    }
    setLoadingFees(false);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Students Register
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {studentList.length} student{studentList.length !== 1 ? 's' : ''} enrolled across {admissions.length} admission{admissions.length !== 1 ? 's' : ''}.
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
            placeholder="Search by name, enrollment, mobile, course..."
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
            <option value="All">All Students</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="paid">Fully Paid</option>
            <option value="pending">Pending Dues</option>
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="h-8 w-8 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
            <p className="mt-3 text-xs text-slate-400">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Users className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No students found</p>
          </div>
        ) : (
          filteredStudents.map((group) => {
            const s = group.student;
            return (
              <div
                key={s._id}
                className="group rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-[#0b3c68]/30 hover:shadow-md transition cursor-pointer"
                onClick={() => handleViewStudent(group)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#0b3c68] text-white font-bold text-sm shadow">
                    {s.profilePhoto ? (
                      <img src={s.profilePhoto} alt="" className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      s.fullName?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{s.fullName}</h3>
                      {group.hasLock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="inline-block rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-[#0b3c68]">
                        {s.enrollmentNo}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {s.mobile}
                      </span>
                      {s.email && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 hidden sm:inline">
                          <Mail className="h-3 w-3" /> {s.email}
                        </span>
                      )}
                    </div>

                    {/* Courses pills */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {group.courses.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          <BookOpen className="h-3 w-3" /> {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-sm font-bold text-slate-900">{'\u20B9'}{group.totalFee.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Paid: {'\u20B9'}{group.totalPaid.toLocaleString('en-IN')}</p>
                    {group.totalBalance > 0 && (
                      <p className="text-[10px] text-amber-600 font-semibold">Due: {'\u20B9'}{group.totalBalance.toLocaleString('en-IN')}</p>
                    )}
                  </div>

                  {/* View button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewStudent(group); }}
                    className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-[#0b3c68] hover:text-white transition flex-shrink-0"
                    title="View Student Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile fee summary */}
                <div className="sm:hidden flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400">Total Fee</p>
                    <p className="text-xs font-bold text-slate-900">{'\u20B9'}{group.totalFee.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600">Paid</p>
                    <p className="text-xs font-bold text-emerald-700">{'\u20B9'}{group.totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  {group.totalBalance > 0 && (
                    <div>
                      <p className="text-[10px] text-amber-600">Due</p>
                      <p className="text-xs font-bold text-amber-700">{'\u20B9'}{group.totalBalance.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-3xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Profile</span>
                <h3 className="font-display text-lg font-black text-slate-900">
                  {selectedStudent.student.fullName}
                </h3>
                <p className="text-[10px] text-slate-400">{selectedStudent.student.enrollmentNo}</p>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setStudentFees([]); }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info Grid */}
              <div className="rounded-2xl bg-slate-50 p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Personal Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Full Name</span>
                    <span className="font-bold text-slate-900">{selectedStudent.student.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Gender</span>
                    <span className="font-bold text-slate-900 capitalize">{selectedStudent.student.gender || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Date of Birth</span>
                    <span className="font-bold text-slate-900">{formatDate(selectedStudent.student.dob)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Blood Group</span>
                    <span className="font-bold text-slate-900">{selectedStudent.student.bloodGroup || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Mobile</span>
                    <span className="font-bold text-slate-900">{selectedStudent.student.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Email</span>
                    <span className="font-bold text-slate-900">{selectedStudent.student.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Guardian</span>
                    <span className="font-bold text-slate-900">
                      {selectedStudent.student.guardianName || '-'}
                      {selectedStudent.student.guardianRelation ? ` (${selectedStudent.student.guardianRelation})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">ID Proof</span>
                    <span className="font-bold text-slate-900">{selectedStudent.student.idProofType || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Address</span>
                    <span className="font-bold text-slate-900 line-clamp-2">{selectedStudent.student.address || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Enrolled Courses ({selectedStudent.courses.length})
                </h4>
                <div className="space-y-3">
                  {selectedStudent.courses.map((c, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{c.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {c.admissionNo} &middot; {formatDate(c.admissionDate)}
                          </p>
                          {c.batch && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> {c.batch}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{'\u20B9'}{c.fee.toLocaleString('en-IN')}</p>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                            c.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[10px]">
                        <span className="text-emerald-600 font-semibold">Paid: {'\u20B9'}{c.paid.toLocaleString('en-IN')}</span>
                        {c.balance > 0 && (
                          <span className="text-amber-600 font-semibold">Due: {'\u20B9'}{c.balance.toLocaleString('en-IN')}</span>
                        )}
                        {c.balance === 0 && (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Fully Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Ledger (if loaded) */}
              {loadingFees ? (
                <div className="text-center py-4">
                  <div className="h-5 w-5 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                </div>
              ) : studentFees.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Fee Ledger
                  </h4>
                  <div className="space-y-2">
                    {studentFees.map((fp, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 p-3 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800">{fp.courseName || 'Course'}</span>
                          <span className="font-bold text-slate-900">{'\u20B9'}{(fp.totalFee || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {fp.installments?.length > 0 && (
                          <div className="space-y-1.5">
                            {fp.installments.map((inst, j) => (
                              <div key={j} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                <div>
                                  <span className="font-semibold text-slate-700">Installment #{inst.installmentNo || j + 1}</span>
                                  <span className="text-[10px] text-slate-400 ml-2">
                                    Due: {formatDate(inst.dueDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{'\u20B9'}{(inst.amount || 0).toLocaleString('en-IN')}</span>
                                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                    inst.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                    inst.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {inst.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Summary */}
              <div className="rounded-2xl bg-[#0b3c68]/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Total</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-bold text-slate-900">Fee: {'\u20B9'}{selectedStudent.totalFee.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-bold text-emerald-700">Paid: {'\u20B9'}{selectedStudent.totalPaid.toLocaleString('en-IN')}</span>
                    {selectedStudent.totalBalance > 0 && (
                      <span className="text-sm font-bold text-amber-700">Due: {'\u20B9'}{selectedStudent.totalBalance.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
                {selectedStudent.totalBalance === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    <CheckCircle className="h-4 w-4" /> All Clear
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4" /> Pending
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4 rounded-b-3xl flex justify-end">
              <button
                onClick={() => { setSelectedStudent(null); setStudentFees([]); }}
                className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#12518a]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
