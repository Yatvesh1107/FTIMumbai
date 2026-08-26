import { AlertTriangle, Clock, Lock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Grace Period Modal — orange/yellow
export function GracePeriodModal({ isOpen, onClose, studentName, amount, dueDate, daysRemaining }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Payment Due Soon</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-slate-700 mb-2">Hi <strong>{studentName}</strong>,</p>
          <p className="text-sm text-slate-600 mb-4">
            Your payment of <strong className="text-amber-600">{'\u20B9'}{amount?.toLocaleString('en-IN')}</strong> is due on <strong>{formattedDate}</strong>.
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-6">
            <p className="text-xs font-bold text-amber-700">
              {daysRemaining > 0 ? daysRemaining + ' day' + (daysRemaining > 1 ? 's' : '') + ' remaining' : 'Payment is due today'}
            </p>
            <p className="text-[10px] text-amber-600 mt-1">Please pay before the due date to avoid late fees.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Remind Later
            </button>
            <button onClick={() => { onClose(); navigate('/student/fees'); }} className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition shadow-md">
              <CreditCard className="h-4 w-4 inline mr-1.5" />Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overdue Modal — red
export function OverduePaymentModal({ isOpen, onClose, studentName, amount, overdueDays, courseName }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Payment Overdue</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-slate-700 mb-2">Hi <strong>{studentName}</strong>,</p>
          <p className="text-sm text-slate-600 mb-4">
            Your payment of <strong className="text-red-600">{'\u20B9'}{amount?.toLocaleString('en-IN')}</strong> for <strong>{courseName || 'your course'}</strong> is overdue by <strong className="text-red-600">{overdueDays} day{overdueDays > 1 ? 's' : ''}</strong>.
          </p>
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-6">
            <p className="text-xs font-bold text-red-700">Late fees may be applied</p>
            <p className="text-[10px] text-red-600 mt-1">Please clear your dues immediately to avoid account restrictions.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Remind Later
            </button>
            <button onClick={() => { onClose(); navigate('/student/fees'); }} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition shadow-md">
              <CreditCard className="h-4 w-4 inline mr-1.5" />Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Account Locked Modal — dark
export function AccountLockedModal({ isOpen, onClose, studentName, lockReason, amount }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Account Locked</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-slate-700 mb-2">Hi <strong>{studentName}</strong>,</p>
          <p className="text-sm text-slate-600 mb-4">
            Your account has been <strong className="text-red-600">locked</strong> due to overdue payment of <strong className="text-red-600">{'\u20B9'}{amount?.toLocaleString('en-IN')}</strong>.
          </p>
          {lockReason && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-4">
              <p className="text-[10px] text-red-600">{lockReason}</p>
            </div>
          )}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-6">
            <p className="text-xs font-bold text-slate-700">Portal access restricted</p>
            <p className="text-[10px] text-slate-500 mt-1">Clear your dues to restore full access to the student portal.</p>
          </div>
          <button onClick={() => { onClose(); navigate('/student/fees'); }} className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-bold text-white hover:bg-slate-900 transition shadow-md">
            <CreditCard className="h-4 w-4 inline mr-1.5" />Clear Dues Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default { GracePeriodModal, OverduePaymentModal, AccountLockedModal };
