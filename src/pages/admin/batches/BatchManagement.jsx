import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function BatchManagement() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('All');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    courseId: '',
    batchName: '',
    batchCode: '',
    timing: '09:00 AM - 11:00 AM',
    days: 'Mon - Fri',
    startDate: new Date().toISOString().split('T')[0],
    maxCapacity: 30
  });

  const fetchCourses = async () => {
    try {
      const res = await apiRequest('/courses');
      if (res.success && res.courses.length > 0) {
        setCourses(res.courses);
        setFormData(prev => ({ ...prev, courseId: res.courses[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const url = selectedCourseId !== 'All' ? `/batches?courseId=${selectedCourseId}` : '/batches';
      const res = await apiRequest(url);
      if (res.success) {
        setBatches(res.batches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [selectedCourseId]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.batchName || !formData.batchCode || !formData.timing) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await apiRequest('/batches', 'POST', formData);
      if (res.success) {
        setCreateModalOpen(false);
        setFormData({
          courseId: courses[0]?._id || '',
          batchName: '',
          batchCode: '',
          timing: '09:00 AM - 11:00 AM',
          days: 'Mon - Fri',
          startDate: new Date().toISOString().split('T')[0],
          maxCapacity: 30
        });
        fetchBatches();
      }
    } catch (err) {
      setError(err.message || 'Error creating batch');
    } finally {
      setSaving(false);
    }
  };

  const filtered = batches.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.batchName?.toLowerCase().includes(term) ||
      b.batchCode?.toLowerCase().includes(term) ||
      b.courseId?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Course Batches & Student Cohort Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Create and organize training batches by course, schedule timings, and isolate batch-wise exams.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Create New Batch
        </button>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batches by batch name, code, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs font-medium focus:border-[#0b3c68] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-bold text-[#0b3c68] focus:border-[#0b3c68] focus:outline-none"
          >
            <option value="All">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center">#</th>
                <th className="py-3.5 px-4">Batch Code</th>
                <th className="py-3.5 px-4">Batch Name</th>
                <th className="py-3.5 px-4">Course Name</th>
                <th className="py-3.5 px-4">Timing & Days</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-[#0b3c68] border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading batches...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic space-y-2">
                    <p>No batches found matching filter.</p>
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3c68] underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Create first batch
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((batch, idx) => (
                  <tr key={batch._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0b3c68]">
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] border border-sky-200">
                        {batch.batchCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-sm">{batch.batchName}</span>
                      <span className="text-[10px] text-slate-400">Starts: {new Date(batch.startDate).toLocaleDateString('en-IN')}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {batch.courseId?.name || 'FTI Course'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> {batch.timing}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{batch.days}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-800 border border-indigo-200">
                        <Users className="h-3.5 w-3.5 text-indigo-600" /> {batch.enrolledCount || 0} / {batch.maxCapacity || 30} Students
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> {batch.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Batch Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Create Training Batch
                </h3>
                <p className="text-[11px] text-slate-400">Set up a new student cohort for course admissions & exams.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block uppercase text-[10px] text-slate-400 font-bold">Target Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-[#0b3c68]"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">Batch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Regular Batch"
                    value={formData.batchName}
                    onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">Batch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FSWD-M01"
                    value={formData.batchCode}
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold text-[#0b3c68] uppercase"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">Class Timing *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM - 11:00 AM"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">Schedule Days</label>
                  <input
                    type="text"
                    placeholder="e.g. Mon - Fri or Sat - Sun"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400 font-bold">Max Student Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#0b3c68] px-7 py-2 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-50"
                >
                  {saving ? 'Creating Batch...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
