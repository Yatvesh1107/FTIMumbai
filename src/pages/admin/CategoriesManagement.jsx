import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiRequest, assetUrl, uploadImage } from '../../utils/api';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import {
  LayoutGrid as CategoryIcon,
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
import CourseSelect from '../../components/CourseSelect';

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

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
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
  const [slugAuto, setSlugAuto] = useState(true);
  const [navLabelAuto, setNavLabelAuto] = useState(true);

  const fetchAll = async () => {
    try {
      const [categoryRes, courseRes] = await Promise.all([
        apiRequest('/categories'),
        apiRequest('/courses'),
      ]);
      setCategories(categoryRes.categories || []);
      setCourses(courseRes.courses || []);
    } catch (err) {
      toast.error(err.message || 'Could not load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([apiRequest('/categories'), apiRequest('/courses')])
      .then(([categoryRes, courseRes]) => {
        if (!alive) return;
        setCategories(categoryRes.categories || []);
        setCourses(courseRes.courses || []);
      })
      .catch((err) => {
        if (alive) toast.error(err.message || 'Could not load categories. Please try again.');
      })
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
    setSlugAuto(true);
    setNavLabelAuto(true);
    setError('');
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      slug: category.slug,
      name: category.name,
      navLabel: category.navLabel,
      poweredBy: category.poweredBy || '',
      eyebrow: category.eyebrow || '',
      headline: category.headline || '',
      description: category.description || '',
      heroImage: category.heroImage || '',
      featureIcon: category.featureIcon || 'Code2',
      enabled: category.enabled !== false,
      orderIndex: category.orderIndex || 0,
      features:
        category.features && category.features.length
          ? category.features.map((f) => ({ title: f.title }))
          : [{ title: '' }],
    });
    setAssignedCourses(category.courses || []);
    setAddCourseId('');
    setSlugAuto(false);
    setNavLabelAuto(false);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ ...emptyForm, features: [{ title: '' }] });
    setAssignedCourses([]);
    setSlugAuto(true);
    setNavLabelAuto(true);
    setError('');
  };

  const handleUploadHero = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, heroImage: url }));
      toast.success('Hero image uploaded.');
    } catch (err) {
      setError(err.message || 'Hero image upload failed.');
      toast.error(err.message || 'Hero image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFeatureChange = (index, value) => {
    const next = form.features.map((f, i) => (i === index ? { title: value } : f));
    setForm((prev) => ({ ...prev, features: next }));
  };

  const handleNameChange = (value) => {
    setForm((prev) => ({ ...prev, name: value }));
    if (!editing && slugAuto) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
    if (!editing && navLabelAuto) {
      setForm((prev) => ({ ...prev, navLabel: value.trim() }));
    }
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
      const msg = 'Slug, name, and nav label are required.';
      setError(msg);
      toast.error(msg);
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
        await apiRequest(`/categories/${editing._id}`, 'PUT', payload);
        toast.success('Category updated successfully.');
      } else {
        await apiRequest('/categories', 'POST', payload);
        toast.success('Category created successfully.');
      }
      setShowModal(false);
      setEditing(null);
      fetchAll();
    } catch (err) {
      setError(err.message || 'Error saving category.');
      toast.error(err.message || 'Error saving category.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? Its courses will be unassigned (not deleted).`)) return;
    try {
      await apiRequest(`/categories/${category._id}`, 'DELETE');
      toast.success('Category deleted successfully.');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Could not delete category.');
    }
  };

  const unassignedCourses = courses.filter((c) => !assignedCourses.some((a) => a._id === c._id));

  const addCourseToCategory = async () => {
    if (!editing || !addCourseId) return;
    const course = courses.find((c) => c._id === addCourseId);
    if (!course) return;
    setAssignBusy(true);
    setError('');
    try {
      const maxOrder = assignedCourses.reduce((m, c) => Math.max(m, Number(c.orderInCategory) || 0), 0);
      await apiRequest(`/courses/${course._id}`, 'PUT', {
        courseCategoryId: editing._id,
        orderInCategory: maxOrder + 1,
      });
      setAssignedCourses((prev) => [
        ...prev,
        { ...course, courseCategoryId: editing._id, orderInCategory: maxOrder + 1 },
      ]);
      setAddCourseId('');
      toast.success(`"${course.name}" assigned to category.`);
    } catch (err) {
      setError(err.message || 'Could not assign course.');
      toast.error(err.message || 'Could not assign course.');
    } finally {
      setAssignBusy(false);
    }
  };

  const removeCourseFromCategory = async (course) => {
    setAssignBusy(true);
    setError('');
    try {
      await apiRequest(`/courses/${course._id}`, 'PUT', { courseCategoryId: null });
      setAssignedCourses((prev) => prev.filter((c) => c._id !== course._id));
      toast.success(`"${course.name}" unassigned.`);
    } catch (err) {
      setError(err.message || 'Could not unassign course.');
      toast.error(err.message || 'Could not unassign course.');
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
        if (String(c.orderInCategory || 0) !== String(i + 1)) {
          await apiRequest(`/courses/${c._id}`, 'PUT', { orderInCategory: i + 1 });
        }
      }
      setAssignedCourses(reordered.map((c, i) => ({ ...c, orderInCategory: i + 1 })));
      toast.success('Course order updated.');
    } catch (err) {
      setError(err.message || 'Could not reorder courses.');
      toast.error(err.message || 'Could not reorder courses.');
    } finally {
      setAssignBusy(false);
    }
  };

  const { page, setPage, total, pageItems } = usePagination(categories);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Course Categories 
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage the course category landing pages. Courses are created/edited in Courses &amp; Pricing Matrix and assigned here.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Create New Category
        </button>
      </div>

      {/* Categories grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="h-8 w-8 animate-spin mx-auto rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 italic">
            No categories found. Click &quot;+ Create New Category&quot; to add one.
          </div>
        ) : (
          pageItems.map((category) => (
            <div
              key={category._id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                    {category.heroImage ? (
                      <img src={assetUrl(category.heroImage)} alt={category.name} className="h-full w-full object-cover" />
                    ) : (
                      <CategoryIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-slate-900">{category.name}</h3>
                    <p className="truncate text-xs text-slate-500">/{category.slug}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className={`rounded-full px-2.5 py-0.5 ${category.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {category.enabled !== false ? 'Live' : 'Hidden'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">{category.navLabel}</span>
                  {category.poweredBy && (
                    <span className="rounded-full bg-terracotta/10 px-2.5 py-0.5 text-terracotta">Powered by {category.poweredBy}</span>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {category.headline || category.description || 'No copy added yet.'}
                </p>

                <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs">
                  <span className="font-bold text-slate-800">{category.courses ? category.courses.length : 0} courses</span>
                  <span className="text-slate-400"> · assigned</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <a
                  href={`/category/${category.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b3c68] hover:underline"
                >
                  View live <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(category)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-[#0b3c68]"
                    title="Edit Category"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {total > 0 && (
        <Pagination
          total={total}
          page={page}
          onPageChange={setPage}
          itemLabel="categories"
        />
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                {editing ? `Edit Category — ${editing.name}` : 'Create New Category'}
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
                      placeholder={editing ? 'e.g. code-data-careers' : 'Auto-filled from name'}
                      value={form.slug}
                      onChange={(e) => {
                        setForm({ ...form, slug: e.target.value });
                        setSlugAuto(false);
                      }}
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
                      onChange={(e) => { setNavLabelAuto(false); setForm({ ...form, navLabel: e.target.value }); }}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Code & Data Careers"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
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
                    placeholder="Category positioning paragraph"
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
                    {formLoading ? 'Saving...' : editing ? 'Save Changes' : 'Create Category'}
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
                              onClick={() => removeCourseFromCategory(course)}
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
                    <CourseSelect
                        courses={unassignedCourses}
                        value={addCourseId}
                        onChange={(courseId) => setAddCourseId(courseId)}
                        placeholder="Select a course to assign..."
                        tone="slate"
                        className="flex-1"
                      />
                    <button
                      onClick={addCourseToCategory}
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