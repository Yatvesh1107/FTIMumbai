import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiRequest, assetUrl, uploadImage } from '../../utils/api';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import CategorySelect from '../../components/CategorySelect';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  X,
  Upload,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

const emptyFormData = {
  name: '',
  courseCode: '',
  category: 'Web Development',
  durationMonths: '3',
  duration: '3 Months',
  durationInDays: 90,
  standardFee: 25000,
  minFloorFee: 18000,
  description: '',
  status: 'Active',
  courseCategoryId: '',
  mode: '',
  provider: '',
  image: ''
};

export default function CoursesManagement() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState(emptyFormData);
  const [codeAuto, setCodeAuto] = useState(true);
  const [wywl, setWywl] = useState(['']);
  const [skills, setSkills] = useState(['']);
  const [content, setContent] = useState([{ heading: '', topics: [''] }]);

  const generateCourseCode = (name) => {
    const words = name
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .split(/[\s-]+/)
      .filter(Boolean);
    if (!words.length) return '';
    const full = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('').toUpperCase();
    return full.length <= 18 ? full : words.slice(0, 4).map((w) => w.charAt(0).toUpperCase()).join('').toUpperCase();
  };

  const handleNameChange = (value) => {
    setFormData((prev) => ({ ...prev, name: value }));
    if (codeAuto) {
      setFormData((prev) => ({ ...prev, courseCode: generateCourseCode(value) }));
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/courses');
      if (res.success) {
        setCourses(res.courses || []);
      }
      const categoryRes = await apiRequest('/categories');
      if (categoryRes.success) {
        setCategories(categoryRes.categories || []);
      }
    } catch (err) {
      toast.error(err.message || 'Could not load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData(emptyFormData);
    setCodeAuto(true);
    setWywl(['']);
    setSkills(['']);
    setContent([{ heading: '', topics: [''] }]);
    setStep(1);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      courseCode: course.courseCode,
      category: course.category || 'General',
      durationMonths: monthsFromDuration(course.duration) || monthsFromDuration(course.durationInDays),
      duration: course.duration,
      durationInDays: course.durationInDays || 90,
      standardFee: course.standardFee,
      minFloorFee: course.minFloorFee,
      description: course.description || '',
      status: course.status,
      courseCategoryId: course.courseCategoryId || '',
      mode: course.mode || '',
      provider: course.provider || 'FTI Mumbai',
      image: course.image || ''
    });
    setWywl(course.wywl && course.wywl.length ? [...course.wywl] : ['']);
    setSkills(course.skills && course.skills.length ? [...course.skills] : ['']);
    setContent(
      course.content && course.content.length
        ? course.content.map((m) => ({
            heading: m.heading || '',
            topics: m.topics && m.topics.length ? [...m.topics] : ['']
          }))
        : [{ heading: '', topics: [''] }]
    );
    setCodeAuto(false);
    setStep(1);
    setError('');
    setShowModal(true);
  };

  const handleUploadImage = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
      toast.success('Card image uploaded.');
    } catch (err) {
      setError(err.message || 'Image upload failed.');
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const monthsFromDuration = (duration) => {
    const m = String(duration || '').match(/\d+(?:\.\d+)?/);
    return m ? m[0] : '';
  };

  const handleDurationChange = (e) => {
    const raw = e.target.value.replace(/[^\d.]/g, '');
    const num = raw ? parseFloat(raw) : NaN;
    setFormData((prev) => ({
      ...prev,
      durationMonths: raw,
      duration: Number.isNaN(num) ? '' : `${num} Months`,
      durationInDays: Number.isNaN(num) ? prev.durationInDays : Math.round(num * 30),
    }));
  };

  const handleGoToStep2 = () => {
    if (!formData.name.trim() || !formData.courseCode.trim()) {
      const msg = 'Course name and course code are required.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (Number(formData.minFloorFee) > Number(formData.standardFee)) {
      const msg = 'Minimum Floor Fee cannot be higher than Standard Course Fee (MRP).';
      setError(msg);
      toast.error(msg);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (Number(formData.minFloorFee) > Number(formData.standardFee)) {
      const msg = 'Minimum Floor Fee cannot be higher than Standard Course Fee (MRP).';
      setError(msg);
      toast.error(msg);
      return;
    }

    const payload = {
      ...formData,
      wywl: wywl.map((t) => t.trim()).filter(Boolean),
      skills: skills.map((t) => t.trim()).filter(Boolean),
      content: content
        .map((m) => ({
          heading: m.heading.trim(),
          topics: m.topics.map((t) => t.trim()).filter(Boolean)
        }))
        .filter((m) => m.heading)
    };

    setFormLoading(true);
    setError('');

    try {
      if (editingCourse) {
        await apiRequest(`/courses/${editingCourse._id}`, 'PUT', payload);
        toast.success('Course updated successfully.');
      } else {
        await apiRequest('/courses', 'POST', payload);
        toast.success('Course created successfully.');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Error saving course.');
      toast.error(err.message || 'Error saving course.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiRequest(`/courses/${id}`, 'DELETE');
      toast.success('Course deleted successfully.');
      fetchCourses();
    } catch (err) {
      toast.error(err.message || 'Could not delete course.');
    }
  };

  const setWywlAt = (i, val) => setWywl((prev) => prev.map((t, j) => (j === i ? val : t)));
  const addWywl = () => setWywl((prev) => [...prev, '']);
  const removeWywl = (i) => setWywl((prev) => (prev.length === 1 ? prev : prev.filter((_, j) => j !== i)));

  const setSkillAt = (i, val) => setSkills((prev) => prev.map((t, j) => (j === i ? val : t)));
  const addSkill = () => setSkills((prev) => [...prev, '']);
  const removeSkill = (i) => setSkills((prev) => (prev.length === 1 ? prev : prev.filter((_, j) => j !== i)));

  const setModuleHeading = (mi, val) =>
    setContent((prev) => prev.map((m, j) => (j === mi ? { ...m, heading: val } : m)));
  const setModuleTopic = (mi, ti, val) =>
    setContent((prev) =>
      prev.map((m, j) => (j === mi ? { ...m, topics: m.topics.map((t, k) => (k === ti ? val : t)) } : m))
    );
  const addModuleTopic = (mi) =>
    setContent((prev) => prev.map((m, j) => (j === mi ? { ...m, topics: [...m.topics, ''] } : m)));
  const removeModuleTopic = (mi, ti) =>
    setContent((prev) =>
      prev.map((m, j) =>
        j === mi ? { ...m, topics: m.topics.length === 1 ? m.topics : m.topics.filter((_, k) => k !== ti) } : m
      )
    );
  const addModule = () => setContent((prev) => [...prev, { heading: '', topics: [''] }]);
  const removeModule = (mi) => setContent((prev) => (prev.length === 1 ? prev : prev.filter((_, j) => j !== mi)));

  const { page, setPage, total, pageItems } = usePagination(courses);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Course Pricing & Floor Matrix
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure Standard MRP Fees and authorize Minimum Negotiable Price Floors for receptionist admission desk.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0b3c68] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] transition"
        >
          <Plus className="h-4 w-4" /> + Create New Course
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="h-8 w-8 animate-spin mx-auto rounded-full border-4 border-[#0b3c68] border-t-transparent"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 italic">
            No courses found. Click "+ Create New Course" to add one.
          </div>
        ) : (
          pageItems.map((course) => {
            const maxDiscount = course.standardFee - course.minFloorFee;
            const discountPercent = Math.round((maxDiscount / course.standardFee) * 100);
            const categoryName = categories.find((c) => c._id === course.courseCategoryId)?.name;

            return (
              <div
                key={course._id}
                className="flex min-w-0 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <span className="max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {course.courseCode}
                    </span>
                    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      <Clock className="h-3 w-3 shrink-0" /> <span className="truncate">{course.duration}</span>
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-1 break-words font-display text-base font-bold text-slate-900">
                    {course.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-slate-500">
                    {course.description || 'Professional job-oriented practical training curriculum.'}
                  </p>

                  <div className="mt-3 flex min-w-0 flex-wrap gap-1.5 text-[10px] font-bold">
                    {course.provider && (
                      <span className="inline-block max-w-full truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">{course.provider}</span>
                    )}
                    {course.mode && (
                      <span className="inline-block max-w-full truncate rounded-full bg-sky-50 px-2.5 py-0.5 text-sky-700">{course.mode}</span>
                    )}
                    {categoryName && (
                      <span className="inline-block max-w-full truncate rounded-full bg-terracotta/10 px-2.5 py-0.5 text-terracotta">{categoryName}</span>
                    )}
                  </div>

                  {/* Pricing Matrix Box */}
                  <div className="mt-4 min-w-0 space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 truncate font-semibold text-slate-500">Standard MRP Fee:</span>
                      <span className="shrink-0 whitespace-nowrap text-sm font-bold text-slate-900">₹{course.standardFee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2 border-t border-slate-200/60 pt-1.5">
                      <span className="min-w-0 truncate font-bold text-amber-700">Min Floor Limit:</span>
                      <span className="shrink-0 whitespace-nowrap text-sm font-black text-amber-700">₹{course.minFloorFee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] font-semibold text-emerald-700">
                      <span className="min-w-0 truncate">Max Discount Range:</span>
                      <span className="shrink-0 whitespace-nowrap">₹{maxDiscount.toLocaleString('en-IN')} ({discountPercent}%)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex min-w-0 items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="min-w-0 truncate text-[11px] font-bold text-slate-400">
                    {course.totalStudents || 0} Students Enrolled
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-[#0b3c68]"
                      title="Edit Course"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {total > 0 && (
        <Pagination
          total={total}
          page={page}
          onPageChange={setPage}
          itemLabel="courses"
        />
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 sm:p-6">
          <div className={`relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${step === 2 ? 'max-w-3xl' : 'max-w-xl'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {editingCourse ? 'Edit Course & Syllabus' : 'Create New Course'}
                </h3>
                {/* Step indicator */}
                <div className="mt-2 flex items-center gap-1.5">
                  {[
                    { n: 1, label: 'Course & Pricing', icon: <Plus className="h-3 w-3" /> },
                    { n: 2, label: 'Content & Syllabus', icon: <FileText className="h-3 w-3" /> },
                  ].map((s) => (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => s.n === 1 || step === 2 ? (s.n === 1 ? setStep(1) : setStep(2)) : null}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold transition ${
                        step === s.n ? 'bg-[#0b3c68] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {s.icon} {s.n}. {s.label}
                    </button>
                  ))}
                </div>
              </div>
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

            <form onSubmit={handleSaveCourse} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 text-xs font-semibold text-slate-700 sm:px-6">
              {step === 1 && (
                <>
                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Course Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master in Web Designing"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block uppercase text-[10px] text-slate-400">Course Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FTI-MWD"
                        value={formData.courseCode}
                        onChange={(e) => { setCodeAuto(false); setFormData({ ...formData, courseCode: e.target.value }); }}
                        className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs uppercase text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block uppercase text-[10px] text-slate-400">Duration (Months)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 1.5"
                        value={formData.durationMonths}
                        onChange={handleDurationChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Category placement */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <span className="font-bold text-[#0b3c68] uppercase tracking-wider text-[10px] block">
                      Category &amp; Marketing Placement
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block uppercase text-[10px] text-slate-400">Assign to Category</label>
                        <CategorySelect
                          categories={categories}
                          value={formData.courseCategoryId}
                          onChange={(courseCategoryId) => setFormData({ ...formData, courseCategoryId })}
                          placeholder="Not assigned"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] text-slate-400">Mode</label>
                        <select
                          value={formData.mode}
                          onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                        >
                          <option value="">— Select mode —</option>
                          <option value="online">online</option>
                          <option value="classroom">classroom</option>
                          <option value="online + classroom">online + classroom</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block uppercase text-[10px] text-slate-400">Provider Badge</label>
                        <input
                          type="text"
                          placeholder="e.g. FTI Mumbai"
                          value={formData.provider}
                          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white p-2">
                          {formData.image ? (
                            <img src={assetUrl(formData.image)} alt="Card" className="h-9 w-9 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-[#0b3c68] hover:underline">
                            <Upload className="h-3.5 w-3.5" />
                            {uploading ? 'Uploading...' : 'Card image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={(e) => handleUploadImage(e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Ceilings */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <span className="font-bold text-[#0b3c68] uppercase tracking-wider text-[10px] block">
                      Dynamic Price Floor Configuration
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold">Standard Fee (MRP) *</label>
                        <input
                          type="number"
                          required
                          value={formData.standardFee}
                          onChange={(e) => setFormData({ ...formData, standardFee: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-amber-700 font-bold">Min Floor Limit (Bottom) *</label>
                        <input
                          type="number"
                          required
                          value={formData.minFloorFee}
                          onChange={(e) => setFormData({ ...formData, minFloorFee: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-amber-700"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Receptionists will be able to discount within this range during student admissions.
                    </p>
                  </div>

                  <div>
                    <label className="block uppercase text-[10px] text-slate-400">Course Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Overview of syllabus and skills taught..."
                      className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                    />
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
                      type="button"
                      onClick={handleGoToStep2}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a]"
                    >
                      Next: Content &amp; Syllabus <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="rounded-xl bg-navy/5 p-3 text-[11px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
                    These sections are shown on the public <strong>Course Detail</strong> page: the module cards under "
                    Course Content", "What you'll learn" bullets, and "Skills you will gain" chips.
                  </p>

                  {/* What you'll learn */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b3c68] uppercase tracking-wider text-[10px] block">
                        What You'll Learn
                      </span>
                      <button
                        type="button"
                        onClick={addWywl}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b3c68] hover:underline"
                      >
                        <Plus className="h-3 w-3" /> Add point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {wywl.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-4 text-center text-[10px] font-bold text-slate-400">{i + 1}.</span>
                          <input
                            type="text"
                            value={t}
                            placeholder={`e.g. Build a complete MERN application with live deployment`}
                            onChange={(e) => setWywlAt(i, e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeWywl(i)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Content modules */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b3c68] uppercase tracking-wider text-[10px] block">
                        Course Content (Modules &amp; Topics)
                      </span>
                      <button
                        type="button"
                        onClick={addModule}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b3c68] hover:underline"
                      >
                        <Plus className="h-3 w-3" /> Add module
                      </button>
                    </div>

                    {content.map((mod, mi) => (
                      <div key={mi} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">Module {mi + 1}</span>
                          <input
                            type="text"
                            value={mod.heading}
                            placeholder="e.g. HTML5 & CSS3 Fundamentals"
                            onChange={(e) => setModuleHeading(mi, e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeModule(mi)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove module"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="pl-4 space-y-1.5">
                          {mod.topics.map((t, ti) => (
                            <div key={ti} className="flex items-center gap-2">
                              <span className="w-4 text-center text-[10px] font-bold text-slate-400">{ti + 1}.</span>
                              <input
                                type="text"
                                value={t}
                                placeholder={`Topic ${ti + 1}`}
                                onChange={(e) => setModuleTopic(mi, ti, e.target.value)}
                                className="w-full rounded-lg border border-slate-200 p-1.5 text-[11px] text-slate-800 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => removeModuleTopic(mi, ti)}
                                className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600"
                                title="Remove topic"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addModuleTopic(mi)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b3c68] hover:underline"
                          >
                            <Plus className="h-3 w-3" /> Add topic
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b3c68] uppercase tracking-wider text-[10px] block">
                        Skills You Will Gain
                      </span>
                      <button
                        type="button"
                        onClick={addSkill}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b3c68] hover:underline"
                      >
                        <Plus className="h-3 w-3" /> Add skill
                      </button>
                    </div>
                    <div className="space-y-2">
                      {skills.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-4 text-center text-[10px] font-bold text-slate-400">{i + 1}.</span>
                          <input
                            type="text"
                            value={t}
                            placeholder={`e.g. React & Redux architecture`}
                            onChange={(e) => setSkillAt(i, e.target.value)}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => removeSkill(i)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-40"
                    >
                      {formLoading ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}