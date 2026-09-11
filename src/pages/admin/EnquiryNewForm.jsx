import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Save
} from 'lucide-react';

const inputCls = "mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm font-medium text-slate-900 bg-white focus:border-[#0b3c68] focus:outline-none";
const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider";

export default function EnquiryNewForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    courseInterest: '',
    source: 'walk_in',
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
      const res = await apiRequest('/enquiries', 'POST', form);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/admin/enquiries/${res.enquiry._id}`), 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Back link */}
      <Link to="/admin/enquiries" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]">
        <ArrowLeft className="h-4 w-4" /> Back to Enquiries List
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0b3c68]/10 px-3 py-1 text-xs font-bold text-[#0b3c68]">
            <UserPlus className="h-3.5 w-3.5" /> New Enquiry Entry
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900">Add New Enquiry</h1>
          <p className="text-xs text-slate-500 font-medium">
            Register a walk-in, referral, or phone lead. This creates a new lead in the follow-up pipeline.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> <span>Enquiry saved successfully! Redirecting...</span>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b3c68]">Course Interest &amp; Source</h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
                <label className={labelCls}>Enquiry Source</label>
                <select name="source" value={form.source} onChange={handleChange} className={inputCls}>
                  <option value="walk_in">Walk-in Visit</option>
                  <option value="website">Website Enquiry</option>
                  <option value="phone">Phone Call</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Remarks / Notes</label>
              <textarea name="remarks" rows={3} placeholder="Any initial notes about this lead..." value={form.remarks} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/admin/enquiries')}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#12518a] disabled:opacity-40">
              {loading ? 'Saving...' : 'Save Enquiry'} <Save className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}