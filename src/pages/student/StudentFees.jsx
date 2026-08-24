import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Printer,
  FileCheck
} from 'lucide-react';

export default function StudentFees() {
  const { user } = useAuth();
  const [feeDoc, setFeeDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeStatus = async () => {
      if (!user?.studentId) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiRequest(`/fees/student/${user.studentId}`);
        if (res.success) {
          setFeeDoc(res.feePayment);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
      </div>
    );
  }

  if (!feeDoc) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
        No active fee ledger found for your student profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
          My Fee Account & Payment Ledger
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          View your total course fee, installments timeline, payment receipts, and balance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Agreed Fee</span>
          <h3 className="mt-1 font-display text-2xl font-black text-slate-900">
            ₹{feeDoc.totalFee?.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid So Far</span>
          <h3 className="mt-1 font-display text-2xl font-black text-emerald-700">
            ₹{feeDoc.paidAmount?.toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Remaining Due Balance</span>
          <h3 className={`mt-1 font-display text-2xl font-black ${feeDoc.remainingAmount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
            ₹{feeDoc.remainingAmount?.toLocaleString('en-IN')}
          </h3>
        </div>
      </div>

      {/* Installments Ledger */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-display text-base font-bold text-slate-800">Installments Schedule</h3>
        <div className="space-y-3">
          {feeDoc.installments?.map((inst, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">Installment #{inst.installmentNo}</span>
                <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Due Date: {new Date(inst.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 text-sm">₹{inst.amount?.toLocaleString('en-IN')}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize mt-0.5 ${
                  inst.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {inst.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Receipts */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-display text-base font-bold text-slate-800">Official Payment Receipts</h3>
        <div className="space-y-2.5">
          {feeDoc.transactions?.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 text-xs">
              <div>
                <span className="font-bold text-[#0b3c68]">{t.receiptNo}</span>
                <p className="text-slate-500 text-[10px]">
                  Mode: {t.paymentMode} • Date: {new Date(t.paymentDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 text-sm">₹{t.amount?.toLocaleString('en-IN')}</span>
                <span className="block text-[10px] text-slate-400">{t.remarks || 'Paid'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
