import { useAuth } from '../context/AuthContext';
import { Lock, AlertTriangle, PhoneCall, CreditCard, ShieldAlert } from 'lucide-react';

export default function StudentAppLockModal() {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/30 bg-white shadow-2xl">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-[#8a6a5b] p-6 text-white text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur border border-white/30 shadow-inner">
            <Lock className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black tracking-tight">Portal Access Restricted</h2>
          <p className="mt-1 text-xs text-red-100 font-medium">
            Overdue Fee Installment Grace Period Expired
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <div className="flex gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-amber-950">Notice for {user?.name}:</p>
                <p className="mt-1 text-amber-800">
                  {user?.lockReason || 'Your previous fee installment is past the due date and 3-day grace period. Access to LMS video lectures, live classes, study notes, and exams is temporarily locked until payment settlement.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Need Assistance or Instant Unlock?</p>
            <p className="text-sm font-bold text-slate-800">Contact the FTI Reception / Accounts Desk</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
              >
                <PhoneCall className="h-3.5 w-3.5" /> Call Reception: +91 98765 43210
              </a>
              <a
                href="https://wa.me/919876543210?text=Hello%20FTI%20Team,%20I%20want%20to%20clear%20my%20overdue%20fee%20installment."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                WhatsApp Accounts
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-100/60 px-6 py-3.5 text-center text-[11px] text-slate-500 font-medium">
          Once your payment is registered at the reception, your portal unlocks instantly automatically.
        </div>
      </div>
    </div>
  );
}
