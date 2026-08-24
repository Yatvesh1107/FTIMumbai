import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../../utils/api';
import {
  Clock,
  Plus,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  FileCheck,
  Eye,
  Users
} from 'lucide-react';

export default function AssignmentsList() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('All');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await apiRequest('/courses');
      if (res.success) setCourses(res.courses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      if (selectedCourseId !== 'All') {
        const res = await apiRequest(`/academics/courses/${selectedCourseId}/assignments`);
        if (res.success) {
          const course = courses.find(c => c._id === selectedCourseId);
          setAssignments((res.assignments || []).map(a => ({ ...a, courseName: course?.name })));
        }
      } else {
        if (courses.length > 0) {
          const allPromises = courses.map(c => apiRequest(`/academics/courses/${c._id}/assignments`));
          const allRes = await Promise.all(allPromises);
          const combined = allRes.flatMap((r, i) =>
            (r.assignments || []).map(a => ({ ...a, courseName: courses[i]?.name }))
          );
          setAssignments(combined);
        }
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
    if (courses.length > 0) {
      fetchAssignments();
    }
  }, [courses, selectedCourseId]);

  const filtered = assignments.filter((a) => {
    const term = searchTerm.toLowerCase();
    return a.title?.toLowerCase().includes(term) || a.courseName?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Practical Assignments & Project Tasks
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage course tasks, track student project deliverables, and evaluate submissions.
          </p>
        </div>

        <Link
          to="/admin/assignments/new"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-800 transition"
        >
          <Plus className="h-4 w-4" /> + Create New Assignment
        </Link>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments by task title or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs font-medium focus:border-teal-700 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-bold text-teal-800 focus:border-teal-700 focus:outline-none"
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

      {/* Tabular Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#082c4d] text-white uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">Assignment Title</th>
                <th className="py-3.5 px-4">Course Name</th>
                <th className="py-3.5 px-4">Max Marks</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-center">Actions / Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin mx-auto rounded-full border-2 border-teal-700 border-t-transparent"></div>
                    <span className="block mt-2 text-[11px]">Loading assignments...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic space-y-2">
                    <p>No practical assignments found.</p>
                    <Link to="/admin/assignments/new" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 underline">
                      <Plus className="h-3.5 w-3.5" /> Create first assignment
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((ass, idx) => (
                  <tr key={ass._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{ass.title}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{ass.instructions}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {ass.courseName || 'FTI Course'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                        {ass.totalMarks} Marks
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">
                      {new Date(ass.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/admin/assignments/${ass._id}/submissions`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
                      >
                        <Users className="h-3.5 w-3.5" /> Review Submissions & Grade
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
