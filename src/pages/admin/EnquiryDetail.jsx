import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  PhoneCall,
  ArrowLeft,
  AlertCircle,
  Pencil,
  Trash2,
  UserPlus,
  ArrowRight,
  Clock,
  Mail,
  MessageCircle,
  Users,
  Inbox,
  CheckCircle2,
  CalendarClock,
  Search,
  Phone
} from 'lucide-react';

const STATUS_META = {
  new:       { label: 'New',        cls: 'bg-sky-100 text-sky-700 border-sky-200',      dot: 'bg-sky-500' },
  contacted: { label: 'Contacted',  cls: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
  follow_up: { label: 'Follow-up',  cls: 'bg-amber-100 text-amber-700 border-amber-200',dot: 'bg-amber-500' },
  converted: { label: 'Converted',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  lost:      { label: 'Lost',       cls: 'bg-red-100 text-red-700 border-red-200',      dot: 'bg-red-500' }
};

const SOURCE_LABELS = {
  website: 'Website', walk_in: 'Walk-in', referral: 'Referral',
  social_media: 'Social Media', phone: 'Phone', other: 'Other'
};

const FOLLOWUP_TYPES = [
  { value: 'call', label: 'Call', icon: PhoneCall, bg: 'bg-sky-100 text-sky-700' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, bg: 'bg-emerald-100 text-emerald-700' },
  { value: 'email', label: 'Email', icon: Mail, bg: 'bg-blue-100 text-blue-700' },
  { value: 'meeting', label: 'Meeting', icon: Users, bg: 'bg-purple-100 text-purple-700' },
  { value: 'walk_in', label: 'Walk-in Visit', icon: Inbox, bg: 'bg-amber-100 text-amber-700' },
  { value: 'other', label: 'Other', icon: Clock, bg: 'bg-slate-100 text-slate-700' }
];

export default function EnquiryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followUpForm, setFollowUpForm] = useState({ type: 'call', notes: '', nextFollowUpDate: '' });
  const [saving, setSaving] = useState(false);

  const fetchEnquiry = async () => {
    try {
      const res = await apiRequest(`/enquiries/${id}`);
      if (res.success) setEnquiry(res.enquiry);
    } catch {
      setError('Failed to load enquiry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const res = await apiRequest(`/enquiries/${id}/status`, 'PUT', { status });
      if (res.success) setEnquiry(res.enquiry);
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpForm.notes.trim()) {
      setError('Please write follow-up notes before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await apiRequest(`/enquiries/${id}/followup`, 'POST', followUpForm);
      if (res.success) {
        setEnquiry(res.enquiry);
        setFollowUpForm({ type: 'call', notes: '', nextFollowUpDate: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to add follow-up');
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToAdmission = () => {
    const params = new URLSearchParams({
      enquiryId: enquiry._id,
      studentName: enquiry.name,
      mobile: enquiry.mobile,
      email: enquiry.email,
      courseInterest: enquiry.courseInterest
    });
    navigate(`/admin/admissions/new?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this enquiry permanently?')) return;
    try {
      await apiRequest(`/enquiries/${id}`, 'DELETE');
      navigate('/admin/enquiries');
    } catch {
      setError('Failed to delete enquiry.');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-500">{error || 'Enquiry not found.'}</p>
        <Link to="/admin/enquiries" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Enquiries
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[enquiry.status] || STATUS_META.new;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link to="/admin/enquiries" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b3c68]">
        <ArrowLeft className="h-4 w-4" /> Back to Enquiries List
      </Link>

      {/* Header card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-black text-slate-900">{enquiry.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}></span>
                {meta.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {enquiry.mobile}</span>
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {enquiry.email}</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {SOURCE_LABELS[enquiry.source] || enquiry.source}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/enquiries/${enquiry._id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            {enquiry.status !== 'converted' && (
              <button onClick={handleConvertToAdmission}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-xs font-bold text-white shadow hover:opacity-95">
                <UserPlus className="h-3.5 w-3.5" /> Convert to Admission <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Key info grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course Interest</span>
            <p className="mt-1 text-sm font-bold text-slate-800">{enquiry.courseInterest}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enquiry Date</span>
            <p className="mt-1 text-sm font-bold text-slate-800">{formatDate(enquiry.createdAt)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Follow-ups</span>
            <p className="mt-1 text-sm font-bold text-slate-800">{enquiry.followUpCount || 0}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Next Follow-up</span>
            <p className="mt-1 text-sm font-bold text-orange-700">{formatDate(enquiry.nextFollowUpDate)}</p>
          </div>
        </div>

        {enquiry.remarks && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remarks</span>
            <p className="mt-1 text-xs text-slate-700">{enquiry.remarks}</p>
          </div>
        )}

        {enquiry.convertedStudentId && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Converted to admission —{' '}
            {enquiry.convertedStudentId.fullName || 'Student'}
            {enquiry.convertedStudentId.enrollmentNo ? ` (${enquiry.convertedStudentId.enrollmentNo})` : ''}
          </div>
        )}

        {/* Status selector */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Search className="h-4 w-4 text-[#0b3c68]" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Update Status:</span>
          <select
            value={enquiry.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold focus:border-[#0b3c68]"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow-up</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-bold text-red-800 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" /> <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Follow-up history */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#0b3c68]" /> Follow-up History ({enquiry.followUps?.length || 0})
          </h2>

          {enquiry.followUps?.length > 0 ? (
            <div className="mt-5 space-y-3 border-l-2 border-slate-100 pl-5">
              {enquiry.followUps.map((fu, idx) => {
                const FT = FOLLOWUP_TYPES.find(t => t.value === fu.type) || FOLLOWUP_TYPES[FOLLOWUP_TYPES.length - 1];
                const Icon = FT.icon;
                return (
                  <div key={idx} className="relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className={`absolute -left-[31px] top-4 flex h-5 w-5 items-center justify-center rounded-full ${FT.bg}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${FT.bg}`}>{FT.label}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(fu.date)} {fu.conductedBy?.name ? `· ${fu.conductedBy.name}` : ''}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">{fu.notes}</p>
                    {fu.nextFollowUpDate && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
                        <CalendarClock className="h-3 w-3" /> Next: {formatDate(fu.nextFollowUpDate)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-xs text-slate-500 italic">No follow-ups recorded yet. Add the first follow-up →</p>
            </div>
          )}
        </div>

        {/* Add follow-up */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-[#0b3c68]" /> Add Follow-up
          </h2>
          {enquiry.status === 'converted' ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
              This lead has been converted to an admission. No further follow-ups needed.
            </p>
          ) : (
            <form onSubmit={handleAddFollowUp} className="mt-4 space-y-4">
              <div className="flex gap-2 flex-wrap">
                {FOLLOWUP_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFollowUpForm({ ...followUpForm, type: t.value })}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold border transition ${
                        followUpForm.type === t.value ? 'border-[#0b3c68] bg-[#0b3c68] text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-[#0b3c68]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {t.label}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Follow-up Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What happened in this follow-up? What did the lead say?"
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#0b3c68] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-600 uppercase tracking-wider">Next Follow-up Date (optional)</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={followUpForm.nextFollowUpDate}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-orange-300 bg-orange-50 p-3 text-xs font-bold text-orange-800 focus:border-orange-400"
                />
              </div>

              <button type="submit" disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#12518a] disabled:opacity-40">
                {saving ? 'Saving...' : 'Save Follow-up'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}