import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { AlertCircle, CheckCircle2, UserPlus, Send, Contact } from 'lucide-react';

const inputCls = "w-full rounded-xl border border-slate-300 p-3 text-sm font-medium text-slate-900 bg-white focus:border-[#0b3c68] focus:outline-none";
const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider";

export default function EnquiryForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    courseInterest: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiRequest('/courses');
        if (res.success) setCourses(res.courses || []);
      } catch {}
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || !form.email.trim() || !form.courseInterest.trim()) {
      setError('Name, mobile, email, and course interest are mandatory.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/enquiries', 'POST', { ...form, source: 'website' });
      if (res.success) {
        setSuccess(true);
        setForm({ name: '', mobile: '', email: '', courseInterest: '', remarks: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-700" />
          </div>
          <h1 className="font-display text-xl font-black text-slate-900">Enquiry Submitted!</h1>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Thank you for your interest. Our counsellor will get in touch with you shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full rounded-xl bg-[#0b3c68] py-3 text-xs font-bold text-white shadow-md hover:bg-[#12518a]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0b3c68]/10 px-3 py-1 text-xs font-bold text-[#0b3c68]">
            <Contact className="h-3.5 w-3.5" /> Admissions Enquiry
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">Register Your Enquiry</h1>
          <p className="text-xs text-slate-500 font-medium">
            Fill in your details and our counsellor will call you back.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">Student / Lead Contact</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" name="name" required placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mobile Number *</label>
                <input type="tel" name="mobile" required placeholder="10-digit mobile" value={form.mobile} onChange={handleChange} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address *</label>
              <input type="email" name="email" required placeholder="student@gmail.com" value={form.email} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">Course Interest</h3>
            <div>
              <label className={labelCls}>Interested Course *</label>
              <select name="courseInterest" required value={form.courseInterest} onChange={handleChange} className={inputCls}>
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.name}>{c.name} {c.courseCode ? `[${c.courseCode}]` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Remarks / Notes</label>
              <textarea name="remarks" rows={3} placeholder="Any questions you have..." value={form.remarks} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#12518a] disabled:opacity-40">
              {loading ? 'Submitting...' : 'Submit Enquiry'} <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}