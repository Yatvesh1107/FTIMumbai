import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function CoursesManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    courseCode: '',
    category: 'Web Development',
    duration: '3 Months',
    durationInDays: 90,
    standardFee: 25000,
    minFloorFee: 18000,
    description: '',
    status: 'Active'
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/courses');
      if (res.success) {
        setCourses(res.courses || []);
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

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      courseCode: '',
      category: 'Web Development',
      duration: '3 Months',
      durationInDays: 90,
      standardFee: 25000,
      minFloorFee: 18000,
      description: '',
      status: 'Active'
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      courseCode: course.courseCode,
      category: course.category || 'General',
      duration: course.duration,
      durationInDays: course.durationInDays || 90,
      standardFee: course.standardFee,
      minFloorFee: course.minFloorFee,
      description: course.description || '',
      status: course.status
    });
    setError('');
    setShowModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (Number(formData.minFloorFee) > Number(formData.standardFee)) {
      setError('Minimum Floor Fee cannot be higher than Standard Course Fee (MRP).');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      if (editingCourse) {
        await apiRequest(`/courses/${editingCourse._id}`, 'PUT', formData);
      } else {
        await apiRequest('/courses', 'POST', formData);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Error saving course.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiRequest(`/courses/${id}`, 'DELETE');
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Could not delete course.');
    }
  };

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
          courses.map((course) => {
            const maxDiscount = course.standardFee - course.minFloorFee;
            const discountPercent = Math.round((maxDiscount / course.standardFee) * 100);

            return (
              <div
                key={course._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {course.courseCode}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      <Clock className="h-3 w-3" /> {course.duration}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-slate-900 line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description || 'Professional job-oriented practical training curriculum.'}
                  </p>

                  {/* Pricing Matrix Box */}
                  <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Standard MRP Fee:</span>
                      <span className="font-bold text-slate-900 text-sm">₹{course.standardFee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                      <span className="text-amber-700 font-bold">Min Floor Limit:</span>
                      <span className="font-black text-amber-700 text-sm">₹{course.minFloorFee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-emerald-700 font-semibold">
                      <span>Max Discount Range:</span>
                      <span>₹{maxDiscount.toLocaleString('en-IN')} ({discountPercent}%)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-400">
                    {course.totalStudents || 0} Students Enrolled
                  </span>
                  <div className="flex gap-2">
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                {editingCourse ? 'Edit Course & Pricing' : 'Create New Course'}
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

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-[10px] text-slate-400">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master in Web Designing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FTI-MWD"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs uppercase text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block uppercase text-[10px] text-slate-400">Duration Display</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Pricing Ceilings */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <span className="font-bold text-[#0b3c68] uppercase tracking-wider text-[10px] block">
                  Dynamic Price Floor Configuration
                </span>
                <div className="grid grid-cols-2 gap-3">
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
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-[#0b3c68] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#12518a] disabled:opacity-40"
                >
                  {formLoading ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
