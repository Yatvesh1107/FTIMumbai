import { useState, useEffect } from 'react';
import { apiRequest, assetUrl, uploadImage } from '../../utils/api';
import {
  School as SchoolIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Upload,
  ImageIcon
} from 'lucide-react';

const FEATURE_ICONS = [
  { value: 'Code2', label: 'Code' },
  { value: 'Building2', label: 'Enterprise' },
  { value: 'Cpu', label: 'Deep Tech' },
  { value: 'DraftingCompass', label: 'Engineering' },
  { value: 'Truck', label: 'Supply Chain' },
];

const emptyForm = {
  slug: '',
  name: '',
  navLabel: '',
  poweredBy: '',
  eyebrow: '',
  headline: '',
  description: '',
  heroImage: '',
  featureIcon: 'Code2',
  enabled: true,
  orderIndex: 1,
  features: [{ title: '' }],
};

export default function SchoolsManagement() {
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({ ...emptyForm, features: [{ title: '' }] });
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [addCourseId, setAddCourseId] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);

  const fetchAll = async () => {
    try {
      const [schoolRes, courseRes] = await Promise.all([
        apiRequest('/schools'),
        apiRequest('/courses'),
      ]);
      setSchools(schoolRes.schools || []);
      setCourses(courseRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([apiRequest('/schools'), apiRequest('/courses')])
      .then(([schoolRes, courseRes]) => {
        if (!alive) return;
        setSchools(schoolRes.schools || []);
        setCourses(courseRes.courses || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, features: [{ title: '' }] });
    setAssignedCourses([]);
    setAddCourseId('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (school) => {
    setEditing(school);
    setForm({
      slug: school.slug,
      name: school.name,
      navLabel: school.navLabel,
      poweredBy: school.poweredBy || '',
      eyebrow: school.eyebrow || '',
      headline: school.headline || '',
      description: school.description || '',
      heroImage: school.heroImage || '',
      featureIcon: school.featureIcon || 'Code2',
      enabled: school.enabled !== false,
      orderIndex: school.orderIndex || 0,
      features:
        school.features && school.features.length
          ? school.features.map((f) => ({ title: f.title }))
          : [{ title: '' }],
    });
    setAssignedCourses(school.courses || []);
    setAddCourseId('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ ...emptyForm, features: [{ title: '' }] });
    setAssignedCourses([]);
    setError('');
  };

  const handleUploadHero = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, heroImage: url }));
    } catch (err) {
      setError(err.message || 'Hero image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFeatureChange = (index, value) => {
    const next = form.features.map((f, i) => (i === index ? { title: value } : f));
    setForm((prev) => ({ ...prev, features: next }));
  };

  const removeFeature = (index) => {
    if (form.features.length === 1) return;
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, { title: '' }] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.slug.trim() || !form.name.trim() || !form.navLabel.trim()) {
      setError('Slug, name, and nav label are required.');
      return;
    }

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      navLabel: form.navLabel.trim(),
      enabled: form.enabled,
      poweredBy: form.poweredBy.trim(),
      eyebrow: form.eyebrow.trim(),
      headline: form.headline.trim(),
      description: form.description.trim(),
      heroImage: form.heroImage,
      featureIcon: form.featureIcon,
      orderIndex: Number(form.orderIndex) || 0,
      features: form.features.map((f) => ({ title: f.title.trim() })).filter((f) => f.title),
    };

    setFormLoading(true);
    setError('');
    try {
      if (editing) {
        await apiRequest(`/schools/${editing._id}`, 'PUT', payload);
      } else {
        await apiRequest('/schools', 'POST', payload);
      }
      setShowModal(false);
      setEditing(null);
      fetchAll();
    } catch (err) {
      setError(err.message || 'Error saving school.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (school) => {
    if (!window.confirm(`Delete school "${school.name}"? Its courses will be unassigned (not deleted).`)) return;
    try {
      await apiRequest(`/schools/${school._id}`, 'DELETE');
      fetchAll();
    } catch (err) {
      alert(err.message || 'Could not delete school.');
    }
  };

  const unassignedCourses = courses.filter((c) => !assignedCourses.some((a) => a._id === c._id));

  const addCourseToSchool = async () => {
    if (!editing || !addCourseId) return;
    const course = courses.find((c) => c._id === addCourseId);
    if (!course) return;
    setAssignBusy(true);
    setError('');
    try {
      const maxOrder = assignedCourses.reduce((m, c) => Math.max(m, Number(c.orderInSchool) || 0), 0);
      await apiRequest(`/courses/${course._id}`, 'PUT', {
        schoolId: editing._id,
        orderInSchool: maxOrder + 1,
      });
      setAssignedCourses((prev) => [
        ...prev,
        { ...course, schoolId: editing._id, orderInSchool: maxOrder + 1 },
      ]);
      setAddCourseId('');
    } catch (err) {
      setError(err.message || 'Could not assign course.');
    } finally {
      setAssignBusy(false);
    }
  };

  const removeCourseFromSchool = async (course) => {
    setAssignBusy(true);
    setError('');
    try {
      await apiRequest(`/courses/${course._id}`, 'PUT', { schoolId: null });
      setAssignedCourses((prev) => prev.filter((c) => c._id !== course._id));
    } catch (err) {
      setError(err.message || 'Could not unassign course.');
    } finally {
      setAssignBusy(false);
    }
  };

  const moveCourse = async (index, dir) => {
    const list = [...assignedCourses];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;

    const reordered = [...list];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;

    setAssignBusy(true);
    setError('');
    try {
      for (let i = 0; i < reordered.length; i++) {
        const c = reordered[i];
        if (String(c.orderInSchool || 0) !== String(i + 1)) {
          await apiRequest(`/courses/${c._id}`, 'PUT', { orderInSchool: i + 1 });
        }
      }
      setAssignedCourses(reordered.map((c, i) => ({ ...c, orderInSchool: i + 1 })));
    } catch (err) {
      setError(err.message || 'Could not reorder courses.');
    } finally {
      setAssignBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Schools &amp; Products
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage the 5 school landing pages. Courses are created/edited in Courses &amp; Pricing Matrix and assigned here.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Create New School
        </button>
      </div>

      {/* Schools grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="h-8 w-8 animate-spin mx-auto rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
          </div>
        ) : schools.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 italic">
            No schools found. Click &quot;+ Create New School&quot; to add one.
          </div>
        ) : (
          schools.map((school) => (
            <div
              key={school._id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                    {school.heroImage ? (
                      <img src={assetUrl(school.heroImage)} alt={school.name} className="h-full w-full object-cover" />
                    ) : (
                      <SchoolIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-slate-900">{school.name}</h3>
                    <p className="truncate text-xs text-slate-500">/{school.slug}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className={`rounded-full px-2.5 py-0.5 ${school.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {school.enabled !== false ? 'Live' : 'Hidden'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">{school.navLabel}</span>
                  {school.poweredBy && (
                    <span className="rounded-full bg-terracotta/10 px-2.5 py-0.5 text-terracotta">Powered by {school.poweredBy}</span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {school.headline || school.description || 'No copy added yet.'}
                </p>

                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs">
                  <span className="font-bold text-slate-800">{school.courses ? school.courses.length : 0} courses</span>
                  <span className="text-slate-400"> · assigned</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <a
                  href={`/${school.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b3c68] hover:underline"
                >
                  View live <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(school)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-[#0b3c68]"
                    title="Edit School"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(school)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete School"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                {editing ? `Edit School — ${editing.name}` : 'Create New School'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-5 text-xs font-semibold text-slate-700">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. code-data-careers"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Nav Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Code & Data"
                      value={form.navLabel}
                      onChange={(e) => setForm({ ...form, navLabel: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">School Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Code & Data Careers"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Powered By (Partner)</label>
                    <input
                      type="text"
                      placeholder="e.g. Codify"
                      value={form.poweredBy}
                      onChange={(e) => setForm({ ...form, poweredBy: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Eyebrow Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Code & Data Careers"
                    value={form.eyebrow}
                    onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Headline</label>
                  <input
                    type="text"
                    placeholder="Page hero headline"
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="School positioning paragraph"
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Feature Icon</label>
                    <select
                      value={form.featureIcon}
                      onChange={(e) => setForm({ ...form, featureIcon: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    >
                      {FEATURE_ICONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Order Index</label>
                    <input
                      type="number"
                      min="0"
                      value={form.orderIndex}
                      onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-300 p-2.5 font-medium">
                      <input
                        type="checkbox"
                        checked={form.enabled}
                        onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                      />
                      <span className="text-xs">Enabled (visible publicly)</span>
                    </label>
                  </div>
                </div>

                {/* Hero image */}
                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Hero Image</label>
                  <div className="mt-1 flex items-center gap-3 rounded-xl border border-slate-300 p-3">
                    {form.heroImage ? (
                      <img src={assetUrl(form.heroImage)} alt="Hero" className="h-14 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                        <Upload className="h-3.5 w-3.5" />
                        {uploading ? 'Uploading...' : 'Upload image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => handleUploadHero(e.target.files[0])}
                        />
                      </label>
                      {form.heroImage && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, heroImage: '' }))}
                          className="ml-2 text-xs font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Features (pills on hero)</label>
                  <div className="mt-1 space-y-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={f.title}
                          placeholder={`Feature ${i + 1}`}
                          onChange={(e) => handleFeatureChange(i, e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                        />
                        {form.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove feature"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0b3c68] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add feature
                  </button>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-40"
                  >
                    {formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create School'}
                  </button>
                </div>
              </form>

              {/* Course assignment panel (edit only) */}
              {editing && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <span className="block uppercase tracking-wider text-[10px] font-bold text-[#0b3c68]">
                    Assigned Courses ({assignedCourses.length})
                  </span>

                  {assignedCourses.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {assignedCourses.map((course, i) => (
                        <li
                          key={course._id}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                          <span className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800">{course.name}</p>
                            <p className="truncate text-[10px] text-slate-500">
                              {course.duration || '—'} · {course.mode || '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveCourse(i, -1)}
                              disabled={assignBusy || i === 0}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                              title="Move up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => moveCourse(i, 1)}
                              disabled={assignBusy || i === assignedCourses.length - 1}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                              title="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => removeCourseFromSchool(course)}
                              disabled={assignBusy}
                              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                              title="Unassign"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={addCourseId}
                      onChange={(e) => setAddCourseId(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium"
                    >
                      <option value="">Select a course to assign...</option>
                      {unassignedCourses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.courseCode ? `[${c.courseCode}]` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addCourseToSchool}
                      disabled={assignBusy || !addCourseId}
                      className="rounded-xl bg-[#0b3c68] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-40"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}