import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Search,
  BookOpen,
  FolderOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function StudentStudyNotes() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Folder view
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Table view
  const [studyNotes, setStudyNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'asc' });
  const [tableLoading, setTableLoading] = useState(false);

  const fetchFolders = async () => {
    try {
      const res = await apiRequest('/courses');
      const courseList = res.success ? res.courses || [] : [];

      const foldersData = await Promise.all(
        courseList.map(async (course) => {
          try {
            const notesRes = await apiRequest(`/academics/courses/${course._id}/notes`);
            const notes = notesRes.success ? notesRes.notes || [] : [];
            return {
              subCourseId: course._id,
              title: course.name,
              courseName: course.category || course.level || 'Course',
              totalCount: notes.length,
              completedCount: notes.filter((n) => n.userAttempt).length
            };
          } catch {
            return {
              subCourseId: course._id,
              title: course.name,
              courseName: course.category || course.level || 'Course',
              totalCount: 0,
              completedCount: 0
            };
          }
        })
      );

      setFolders(foldersData.filter((f) => f.totalCount > 0));
    } catch (err) {
      setError(err.message || 'Failed to fetch study notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchFolders(), 0);
    return () => clearTimeout(timer);
  }, []);

  const openFolder = (folder) => {
    setTableLoading(true);
    setSelectedFolder(folder);
    setCurrentPage(1);
    setSearchTerm('');
    setAppliedSearch('');
    setSortConfig({ key: 'createdAt', direction: 'asc' });

    apiRequest(`/academics/courses/${folder.subCourseId}/notes`)
      .then((res) => {
        setStudyNotes(res.success ? res.notes || [] : []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch notes');
      })
      .finally(() => setTableLoading(false));
  };

  const backToFolders = () => {
    setSelectedFolder(null);
    setStudyNotes([]);
    setSearchTerm('');
    setAppliedSearch('');
    setSortConfig({ key: 'createdAt', direction: 'asc' });
    setCurrentPage(1);
  };

  const getSortValue = (note, key) => {
    switch (key) {
      case 'title':
        return (note.title || '').toLowerCase();
      case 'topic':
        return (note.chapterTitle || '').toLowerCase();
      case 'questions':
        return note.totalQuestions || 0;
      case 'status':
        return note.userAttempt ? 1 : 0;
      case 'createdAt':
        return new Date(note.createdAt || 0).getTime();
      default:
        return '';
    }
  };

  const filteredNotes = studyNotes.filter((n) => {
    const term = appliedSearch.toLowerCase();
    if (!term) return true;
    return (
      n.title?.toLowerCase().includes(term) ||
      n.description?.toLowerCase().includes(term) ||
      n.chapterTitle?.toLowerCase().includes(term)
    );
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const valA = getSortValue(a, sortConfig.key);
    const valB = getSortValue(b, sortConfig.key);
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedNotes.length / ITEMS_PER_PAGE));
  const pagination = { total: sortedNotes.length, totalPages };
  const paginatedNotes = sortedNotes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="h-4 w-4 text-blue-600" />
      : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {start > 1 && (
            <>
              <button onClick={() => setCurrentPage(1)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100">1</button>
              {start > 2 && <span className="px-1 text-gray-400">...</span>}
            </>
          )}
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                p === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
          {end < pagination.totalPages && (
            <>
              {end < pagination.totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
              <button onClick={() => setCurrentPage(pagination.totalPages)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100">{pagination.totalPages}</button>
            </>
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-6">
        {!selectedFolder && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Study Notes</h1>
            <p className="text-gray-600 mt-1">Select a course to view its study notes</p>
          </>
        )}
        {selectedFolder && (
          <>
            <button onClick={backToFolders} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Courses</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedFolder.title}</h1>
            <p className="text-gray-600 mt-1">{pagination.total} note{pagination.total !== 1 ? 's' : ''}</p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* ============ FOLDER VIEW ============ */}
      {!selectedFolder && (
        <>
          {folders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">No Study Notes Found</h3>
              <p className="text-gray-600 mt-2">No study notes available for your enrolled courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {folders.map((folder) => (
                <div
                  key={folder.subCourseId}
                  onClick={() => openFolder(folder)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-400"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <FolderOpen className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{folder.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{folder.courseName}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {folder.totalCount} note{folder.totalCount !== 1 ? 's' : ''}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {folder.completedCount} done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ NOTES TABLE VIEW ============ */}
      {selectedFolder && (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title..."
                className="w-full px-4 py-2.5 pl-12 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          {tableLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading notes...</p>
            </div>
          ) : paginatedNotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">
                {appliedSearch ? 'No notes match your search' : 'No Notes Found'}
              </h3>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left">
                        <span className="text-sm font-semibold text-gray-600 uppercase">Sr No</span>
                      </th>
                      {[
                        { key: 'title', label: 'Title' },
                        { key: 'topic', label: 'Topic' },
                        { key: 'questions', label: 'Questions' },
                        { key: 'status', label: 'Status' },
                        { key: 'createdAt', label: 'Date' }
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-3 text-left cursor-pointer select-none hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort(col.key)}
                        >
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 uppercase">
                            {col.label}
                            <SortIcon columnKey={col.key} />
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center">
                        <span className="text-sm font-semibold text-gray-600 uppercase">Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedNotes.map((note, index) => {
                      const hasMcqs = (note.totalQuestions || 0) > 0;
                      return (
                        <tr key={note._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-500">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{note.title}</p>
                            {note.description && (
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{note.description}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{note.chapterTitle || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{note.totalQuestions || 0}</td>
                          <td className="px-6 py-4">
                            {note.userAttempt ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Completed</span>
                            ) : hasMcqs ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Read Only</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => navigate(`/student/notes/${note._id}`)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                note.userAttempt ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {note.userAttempt ? 'View' : 'Start'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {paginatedNotes.map((note, index) => {
                  const hasMcqs = (note.totalQuestions || 0) > 0;
                  return (
                    <div key={note._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-400">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                            {note.userAttempt ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Completed</span>
                            ) : hasMcqs ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Read Only</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900">{note.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{note.chapterTitle || 'No topic'} &bull; {note.totalQuestions || 0} Q</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/student/notes/${note._id}`)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                            note.userAttempt ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {note.userAttempt ? 'View' : 'Start'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
