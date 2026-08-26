import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const TYPE_ICONS = {
  fee_reminder: '💰', fee_overdue: '🔴', fee_critical: '🚨', payment_success: '✅',
  app_lock: '🔒', live_class: '📹', exam_scheduled: '📝', exam_reminder: '⏰',
  assignment: '📋', certificate: '🏆', birthday: '🎂', admission_welcome: '👋',
  account_status: '👤', general: '📌', fee_grace_period: '⏳'
};

const TYPE_LABELS = {
  fee_reminder: 'Fee Reminder', fee_overdue: 'Fee Overdue', fee_critical: 'Fee Critical',
  payment_success: 'Payment Received', app_lock: 'Account Locked', live_class: 'Live Class',
  exam_scheduled: 'Exam Scheduled', exam_reminder: 'Exam Reminder', assignment: 'Assignment',
  certificate: 'Certificate', birthday: 'Birthday', admission_welcome: 'Welcome',
  account_status: 'Account Status', general: 'General', fee_grace_period: 'Grace Period'
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700'
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications(100);
      if (res.success) setNotifications(res.notifications || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { setTimeout(() => { fetchNotifications(); }, 0); }, []);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    if (filter !== 'all' && filter !== 'unread' && filter !== 'read' && n.type !== filter) return false;
    if (searchTerm && !n.title?.toLowerCase().includes(searchTerm.toLowerCase()) && !n.message?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const timeAgo = (date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#0b3c68] p-3 shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadCount > 0 ? unreadCount + ' unread' : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 rounded-xl border border-[#0b3c68]/20 bg-white px-3 py-2 text-xs font-bold text-[#0b3c68] hover:bg-[#0b3c68]/5 transition">
              <CheckCircle className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'fee_reminder', label: 'Fee' },
              { key: 'fee_overdue', label: 'Overdue' },
              { key: 'payment_success', label: 'Payments' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                  filter === f.key ? 'bg-[#0b3c68] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#0b3c68]/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0b3c68] transition"
            />
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-400 italic">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <Bell className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No notifications</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif._id}
                onClick={() => { if (!notif.isRead) handleMarkRead(notif._id); if (notif.link) navigate(notif.link); }}
                className={`rounded-2xl border p-4 transition cursor-pointer ${
                  !notif.isRead ? 'bg-blue-50/60 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-950' : 'text-slate-700'}`}>{notif.title}</h3>
                      {!notif.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${PRIORITY_COLORS[notif.priority] || PRIORITY_COLORS.low}`}>
                        {notif.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                        {TYPE_LABELS[notif.type] || notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-400">{timeAgo(notif.createdAt)}</span>
                      {notif.link && <span className="text-[10px] font-bold text-[#0b3c68] hover:underline">View details</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!notif.isRead && (
                      <button onClick={(e) => { e.stopPropagation(); handleMarkRead(notif._id); }} className="rounded-lg p-1.5 hover:bg-slate-200 transition" title="Mark read">
                        <CheckCircle className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }} className="rounded-lg p-1.5 hover:bg-red-100 transition" title="Delete">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
