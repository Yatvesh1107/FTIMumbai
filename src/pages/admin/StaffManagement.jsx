import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../utils/api';
import {
  UserCog,
  Plus,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  X,
  CheckCircle2,
  XCircle,
  Trash2,
  KeyRound
} from 'lucide-react';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState('receptionist'); // 'receptionist' | 'admin' | 'all'
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'receptionist'
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/auth/users');
      if (res.success) {
        setStaff(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openCreateModal = () => {
    const pwd = randomPassword();
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: pwd,
      role: 'receptionist'
    });
    setGeneratedPassword(pwd);
    setError('');
    setShowModal(true);
  };

  const randomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let p = '';
    for (let i = 0; i < 8; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    return p;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') setGeneratedPassword('');
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const res = await apiRequest('/auth/register', 'POST', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        role: formData.role
      });

      if (res.success) {
        setShowModal(false);
        setFormData({ name: '', email: '', mobile: '', password: '', role: 'receptionist' });
        setGeneratedPassword('');
        fetchStaff();
      }
    } catch (err) {
      setError(err.message || 'Could not create staff member.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await apiRequest(`/auth/users/${id}`, 'DELETE');
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Could not delete staff member.');
    }
  };

  const visibleStaff = staff.filter((u) =>
    filter === 'all' ? u.role !== 'student' : u.role === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="h-6 w-6 text-[#0b3c68]" /> Receptionists &amp; Staff
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Add receptionists from your admin panel. They can then login to the Reception Desk to manage admissions &amp; fees.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Add Receptionist
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {[
          { key: 'receptionist', label: 'Receptionists' },
          { key: 'admin', label: 'Admins' },
          { key: 'all', label: 'All Staff' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-xl px-4 py-1.5 text-[11px] font-bold transition ${
              filter === t.key ? 'bg-[#0b3c68] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Staff List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {filter === 'receptionist' ? 'Receptionist List' : filter === 'admin' ? 'Admin List' : 'Staff List'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="h-8 w-8 animate-spin mx-auto rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
          </div>
        ) : visibleStaff.length === 0 ? (
          <div className="py-16 text-center text-slate-400 italic text-sm">
            No {filter === 'admin' ? 'admins' : 'receptionists'} found. Click "+ Add Receptionist" to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleStaff.map((u) => (
              <div key={u._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b3c68] font-bold text-white text-sm shadow">
                    {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {u.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {u.role}
                      </span>
                      {u.isActive === false && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                      {u.isActive !== false && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</span>
                      {u.mobile && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {u.mobile}</span>}
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-4">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove staff member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Receptionist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="h-5 w-5 text-[#0b3c68]" /> Add New Staff Member
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] text-slate-400">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@ftimumbai.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Mobile No.</label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium bg-white"
                >
                  <option value="receptionist">Receptionist (Admission Desk)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-[10px] text-slate-400">Login Password *</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    name="password"
                    required
                    placeholder="Auto-generated password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const p = randomPassword();
                      setFormData({ ...formData, password: p });
                      setGeneratedPassword(p);
                    }}
                    className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                    title="Generate new password"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Gen
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">
                  Share these credentials with the staff member. They can change it after first login (feature coming soon).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-40"
                >
                  {formLoading ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
