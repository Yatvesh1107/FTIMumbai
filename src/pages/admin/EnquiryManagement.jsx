import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  PhoneCall,
  Plus,
  Search,
  AlertCircle,
  X,
  Inbox,
  ArrowUpRight,
  Clock
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

export default function EnquiryManagement() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await apiRequest(`/enquiries?${params.toString()}`);
      if (res.success) {
        setEnquiries(res.enquiries || []);
        setStatusCounts(res.statusCounts || {});
      }
    } catch {
      setError('Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchEnquiries, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sourceFilter, searchTerm]);

  const timeAgo = (d) => {
    if (!d) return '';
    const diff = new Date().getTime() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0b3c68]/10 px-3 py-1 text-xs font-bold text-[#0b3c68]">
            <PhoneCall className="h-3.5 w-3.5" /> Enquiry & Follow-up Desk
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-slate-900 tracking-tight">
            Enquiries & Follow-ups
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Track every lead from first touch to admission conversion.
          </p>
        </div>
        <Link
          to="/admin/enquiries/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Add New Enquiry
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-bold text-red-800 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" /> <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Status summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[{ key: 'all', label: 'All' }, { key: 'new', label: 'New' }, { key: 'contacted', label: 'Contacted' }, { key: 'follow_up', label: 'Follow-up' }, { key: 'converted', label: 'Converted' }, { key: 'lost', label: 'Lost' }].map(({ key, label }) => {
          const meta = STATUS_META[key];
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-2xl border p-4 text-left transition ${statusFilter === key ? `border-[#0b3c68] ring-2 ring-[#0b3c68]/20 shadow-md` : 'border-slate-200 bg-white hover:shadow-sm'}`}
            >
              <div className="flex items-center justify-between">
                {meta && <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}></span>}
                <span className="text-[11px] font-bold text-slate-500">{label}</span>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-800">
                {key === 'all' ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : statusCounts[key] || 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search + filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm font-medium focus:border-[#0b3c68] focus:outline-none"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-600 focus:border-[#0b3c68]"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="walk_in">Walk-in</option>
            <option value="phone">Phone</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Enquiries table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-500">No enquiries found.</p>
          <Link to="/admin/enquiries/new" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-4 py-2 text-xs font-bold text-white hover:bg-[#12518a]">
            <Plus className="h-3.5 w-3.5" /> Add First Enquiry
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Student / Lead</th>
                <th className="px-4 py-3 font-bold">Course</th>
                <th className="px-4 py-3 font-bold">Source</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Last Follow-up</th>
                <th className="px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enq) => {
                const meta = STATUS_META[enq.status] || STATUS_META.new;
                return (
                  <tr key={enq._id} className="hover:bg-slate-50/70 transition cursor-pointer" onClick={() => navigate(`/admin/enquiries/${enq._id}`)}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{enq.name}</div>
                      <div className="text-[11px] text-slate-500">{enq.mobile} · {enq.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-700 line-clamp-2">{enq.courseInterest}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {SOURCE_LABELS[enq.source] || enq.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold ${meta.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}></span>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {enq.lastFollowUpDate ? (
                        <>
                          <div className="font-semibold text-slate-700 flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(enq.lastFollowUpDate)}</div>
                          <div className="text-[11px] text-slate-400">({enq.followUpCount || 0} follow-ups)</div>
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/enquiries/${enq._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0b3c68] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#12518a] transition"
                      >
                        View <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}