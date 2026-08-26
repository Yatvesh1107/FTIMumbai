import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import {
  CreditCard,
  Search,
  Lock,
  Printer,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function FeeManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lockFilter, setLockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [expandedStudents, setExpandedStudents] = useState({});
  const debounceTimer = useRef(null);

  // Course Selection Modal
  const [courseSelectModal, setCourseSelectModal] = useState(false);
  const [studentFees, setStudentFees] = useState([]);
  const [studentName, setStudentName] = useState('');

  // Collect Fee Modal
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectError, setCollectError] = useState('');

  // Receipt
  const [receiptData, setReceiptData] = useState(null);
  const [lockRoutineLoading, setLockRoutineLoading] = useState(false);

  const fetchFees = async (page = 1, search = '', lock = 'All') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      if (search.trim()) params.set('search', search.trim());
      if (lock === 'Locked') params.set('lock', 'locked');
      else if (lock === 'Active') params.set('lock', 'active');

      const res = await apiRequest(`/fees?${params.toString()}`);
      if (res.success) {
        setStudents(res.students || []);
        setTotalPages(res.totalPages || 1);
        setTotalStudents(res.totalStudents || 0);
        setCurrentPage(res.page || 1);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  // Fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFees(currentPage, debouncedSearch, lockFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage, debouncedSearch, lockFilter]);

  const toggleExpand = (sid) => {
    setExpandedStudents((prev) => ({ ...prev, [sid]: !prev[sid] }));
  };

  const openCollectModal = (fee) => {
    const group = students.find((g) => g.student?._id === (fee.studentId?._id || fee.studentId));
    const pendingFees = (group?.fees || []).filter((f) => f.remainingAmount > 0);

    if (pendingFees.length > 1) {
      setStudentFees(pendingFees);
      setStudentName(fee.studentId?.fullName || '');
      setCourseSelectModal(true);
      return;
    }

    setSelectedFee(fee);
    setCollectAmount(Math.min(fee.remainingAmount, 5000));
    setPaymentMode('UPI');
    setTransactionRef('');
    setRemarks('');
    setCollectError('');
    setCollectModalOpen(true);
  };

  const handleCourseSelect = (fee) => {
    setCourseSelectModal(false);
    setSelectedFee(fee);
    setCollectAmount(Math.min(fee.remainingAmount, 5000));
    setPaymentMode('UPI');
    setTransactionRef('');
    setRemarks('');
    setCollectError('');
    setCollectModalOpen(true);
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFee || collectAmount <= 0) return;

    setCollectLoading(true);
    setCollectError('');

    try {
      const payload = {
        admissionId: selectedFee.admissionId?._id || selectedFee.admissionId,
        amount: Number(collectAmount),
        paymentMode,
        transactionRef,
        remarks
      };

      const res = await apiRequest('/fees/collect', 'POST', payload);
      if (res.success) {
        setCollectModalOpen(false);
        if (res.receiptNo) {
          const rRes = await apiRequest(`/fees/receipt/${res.receiptNo}`);
          if (rRes.success) setReceiptData(rRes.receipt);
        }
        fetchFees(currentPage, debouncedSearch, lockFilter);
      }
    } catch (err) {
      setCollectError(err.message || 'Payment collection failed.');
    } finally {
      setCollectLoading(false);
    }
  };

  const handleUnlockOverride = async (studentId) => {
    if (!window.confirm('Are you sure you want to issue an Admin Override to unlock this student portal?')) return;
    try {
      await apiRequest(`/fees/unlock-override/${studentId}`, 'POST');
      fetchFees(currentPage, debouncedSearch, lockFilter);
    } catch (err) {
      alert(err.message || 'Unlock override failed.');
    }
  };

  const handleRunOverdueCheck = async () => {
    setLockRoutineLoading(true);
    try {
      const res = await apiRequest('/fees/check-overdue-lock', 'POST');
      alert(`Overdue routine completed. ${res.lockedCount} accounts updated.`);
      fetchFees(currentPage, debouncedSearch, lockFilter);
    } catch {
      alert('Error running overdue routine.');
    } finally {
      setLockRoutineLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Fee Ledger & Overdue Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Collect installments, track unpaid dues, issue instant receipts, and manage automated app lockout.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRunOverdueCheck}
            disabled={lockRoutineLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-800 shadow-sm hover:bg-red-100 transition"
          >
            <Lock className="h-3.5 w-3.5" />
            {lockRoutineLoading ? 'Checking...' : 'Run Overdue Lock Routine'}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, mobile, enrollment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:outline-none"
          />
        </div>
        <select
          value={lockFilter}
          onChange={(e) => { setLockFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#0b3c68] focus:outline-none"
        >
          <option value="All">All Portal States</option>
          <option value="Locked">Locked Portals (Overdue)</option>
          <option value="Active">Active Accounts</option>
        </select>
      </div>

      {/* Students Grouped Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-8"></th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Courses</th>
                <th className="py-3.5 px-4">Total Fee</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Remaining</th>
                <th className="py-3.5 px-4">Portal State</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                students.map((group) => {
                  const s = group.student || {};
                  const sid = s._id;
                  const isExpanded = expandedStudents[sid];
                  const hasPending = group.fees.some((f) => f.remainingAmount > 0);

                  return (
                    <React.Fragment key={sid}>
                      {/* Student Row */}
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-2 text-center">
                          <button onClick={() => toggleExpand(sid)} className="text-slate-400 hover:text-[#0b3c68]">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{s.enrollmentNo} &middot; {s.mobile}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {group.fees.length} course{group.fees.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹{group.totalFee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          ₹{group.totalPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${group.totalRemaining > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            ₹{group.totalRemaining.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {group.isLocked ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                <Lock className="h-3 w-3" /> Locked
                              </span>
                              <button
                                onClick={() => handleUnlockOverride(sid)}
                                className="text-[10px] font-bold text-slate-500 underline hover:text-[#0b3c68]"
                              >
                                Override
                              </button>
                            </div>
                          ) : group.totalRemaining === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Clear
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {hasPending ? (
                            group.fees.length === 1 ? (
                              <button
                                onClick={() => openCollectModal(group.fees[0])}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0b3c68] to-[#12518a] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Collect
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setStudentFees(group.fees.filter((f) => f.remainingAmount > 0));
                                  setStudentName(s.fullName);
                                  setCourseSelectModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0b3c68] to-[#12518a] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Collect
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold italic">Fully Settled</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Course Rows */}
                      {isExpanded && group.fees.map((fee) => {
                        const course = fee.courseId || {};
                        return (
                          <tr key={fee._id} className="bg-slate-50/60">
                            <td className="py-2 px-2"></td>
                            <td className="py-2 px-4 pl-8">
                              <p className="text-xs font-semibold text-slate-700">{course.name || 'Course'}</p>
                            </td>
                            <td className="py-2 px-4">
                              <span className="text-[10px] text-slate-500">{fee.admissionId?.admissionNo || ''}</span>
                            </td>
                            <td className="py-2 px-4 text-xs font-bold text-slate-800">
                              ₹{fee.totalFee?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-4 text-xs font-bold text-emerald-700">
                              ₹{fee.paidAmount?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`text-xs font-bold ${fee.remainingAmount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                                ₹{fee.remainingAmount?.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              {fee.remainingAmount === 0 ? (
                                <span className="text-[10px] font-bold text-emerald-600">Settled</span>
                              ) : fee.nextDueDate ? (
                                <span className="text-[10px] font-bold text-orange-600">
                                  Due: {new Date(fee.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              ) : null}
                            </td>
                            <td className="py-2 px-4 text-right">
                              {fee.remainingAmount > 0 && (
                                <button
                                  onClick={() => openCollectModal(fee)}
                                  className="text-[10px] font-bold text-[#0b3c68] hover:underline"
                                >
                                  Collect
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-600">
            <span>Showing {totalStudents} student{totalStudents !== 1 ? 's' : ''} &middot; Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Selection Modal */}
      {courseSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Select Course</h3>
                <p className="text-xs text-slate-500 mt-0.5">Collect fee for <span className="font-bold text-slate-700">{studentName}</span></p>
              </div>
              <button onClick={() => setCourseSelectModal(false)} className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {studentFees.map((fee) => (
                <button
                  key={fee._id}
                  onClick={() => handleCourseSelect(fee)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#0b3c68] hover:bg-sky-50/40 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-[#0b3c68]">{fee.courseId?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Total: ₹{fee.totalFee?.toLocaleString('en-IN')} &middot; Paid: ₹{fee.paidAmount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-xs font-black text-amber-700">
                      ₹{fee.remainingAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${((fee.paidAmount || 0) / (fee.totalFee || 1)) * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      {collectModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Collect Fee Installment</h3>
              <button onClick={() => setCollectModalOpen(false)} className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {collectError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">{collectError}</div>
            )}

            <div className="rounded-2xl bg-slate-50 p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Student:</span>
                <span className="font-bold text-slate-900">{selectedFee.studentId?.fullName}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Course:</span>
                <span className="font-bold text-slate-900">{selectedFee.courseId?.name}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-slate-200/60 pt-1.5 text-amber-700">
                <span>Remaining Dues:</span>
                <span className="font-black text-sm">₹{selectedFee.remainingAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  max={selectedFee.remainingAmount}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Card (POS Swiped)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">UTR / Ref No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref #481923"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Remarks / Receipt Note</label>
                <input
                  type="text"
                  placeholder="Installment payment..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-medium"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collectLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-40"
                >
                  {collectLoading ? 'Processing...' : 'Confirm Collection & Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-display text-xl font-black text-[#0b3c68]">FTI MUMBAI</h2>
                <p className="text-[10px] font-semibold text-slate-400">Official Payment Acknowledgement</p>
              </div>
              <div className="text-right">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {receiptData.receiptNo}
                </span>
                <p className="mt-1 text-[10px] text-slate-400">{new Date(receiptData.paymentDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Student Name:</span>
                <span className="font-bold text-slate-900">{receiptData.student?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Enrollment No:</span>
                <span className="font-bold text-[#0b3c68]">{receiptData.student?.enrollmentNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Course:</span>
                <span className="font-bold text-slate-900">{receiptData.course?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Payment Mode:</span>
                <span className="font-bold text-slate-800">{receiptData.paymentMode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/80 pt-2 font-bold text-sm text-emerald-800">
                <span>Amount Paid:</span>
                <span>₹{receiptData.amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Remaining Balance:</span>
                <span>₹{receiptData.remainingAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <button onClick={() => setReceiptData(null)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Close
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a]">
                <Printer className="h-4 w-4" /> Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
