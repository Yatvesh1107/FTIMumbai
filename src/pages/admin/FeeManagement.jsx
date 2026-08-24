import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Lock,
  Unlock,
  Printer,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lockFilter, setLockFilter] = useState('All');

  // Collect Fee Modal State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectError, setCollectError] = useState('');

  // Printable Receipt State
  const [receiptData, setReceiptData] = useState(null);
  const [lockRoutineLoading, setLockRoutineLoading] = useState(false);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/fees');
      if (res.success) {
        setFees(res.fees || []);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const openCollectModal = (fee) => {
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
        // Fetch newly created receipt for printing preview
        if (res.receiptNo) {
          const rRes = await apiRequest(`/fees/receipt/${res.receiptNo}`);
          if (rRes.success) {
            setReceiptData(rRes.receipt);
          }
        }
        fetchFees();
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
      fetchFees();
    } catch (err) {
      alert(err.message || 'Unlock override failed.');
    }
  };

  const handleRunOverdueCheck = async () => {
    setLockRoutineLoading(true);
    try {
      const res = await apiRequest('/fees/check-overdue-lock', 'POST');
      alert(`Overdue routine completed. ${res.lockedCount} accounts updated.`);
      fetchFees();
    } catch (err) {
      alert('Error running overdue routine.');
    } finally {
      setLockRoutineLoading(false);
    }
  };

  const filteredFees = fees.filter((f) => {
    const student = f.studentId || {};
    const nameMatch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const mobileMatch = student.mobile?.includes(searchTerm);
    const enrollMatch = student.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || mobileMatch || enrollMatch;

    const matchesLock = lockFilter === 'All' ||
      (lockFilter === 'Locked' && f.isAppLocked) ||
      (lockFilter === 'Active' && !f.isAppLocked);

    return matchesSearch && matchesLock;
  });

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
          onChange={(e) => setLockFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#0b3c68] focus:outline-none"
        >
          <option value="All">All Portal States</option>
          <option value="Locked">Locked Portals (Overdue)</option>
          <option value="Active">Active Accounts</option>
        </select>
      </div>

      {/* Fee Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Total Fee</th>
                <th className="py-3.5 px-4">Paid Amount</th>
                <th className="py-3.5 px-4">Remaining Balance</th>
                <th className="py-3.5 px-4">Portal State</th>
                <th className="py-3.5 px-4 text-right">Collect / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No fee records match the search.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const student = fee.studentId || {};
                  const course = fee.courseId || {};
                  const isLocked = fee.isAppLocked || student.status === 'locked';

                  return (
                    <tr key={fee._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{student.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{student.enrollmentNo}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 line-clamp-1">{course.name}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{fee.totalFee?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        ₹{fee.paidAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${fee.remainingAmount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                          ₹{fee.remainingAmount?.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                            <button
                              onClick={() => handleUnlockOverride(student._id)}
                              className="text-[10px] font-bold text-slate-500 underline hover:text-[#0b3c68]"
                              title="Unlock by Admin override"
                            >
                              Override
                            </button>
                          </div>
                        ) : fee.remainingAmount === 0 ? (
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
                        {fee.remainingAmount > 0 ? (
                          <button
                            onClick={() => openCollectModal(fee)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0b3c68] to-[#12518a] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
                          >
                            <CreditCard className="h-3.5 w-3.5" /> Collect Fee
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold italic">Fully Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {collectModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Collect Fee Installment
              </h3>
              <button
                onClick={() => setCollectModalOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {collectError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">
                {collectError}
              </div>
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

      {/* Printable Fee Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            {/* Receipt Header */}
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

            {/* Receipt Details */}
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
              <button
                onClick={() => setReceiptData(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a]"
              >
                <Printer className="h-4 w-4" /> Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
