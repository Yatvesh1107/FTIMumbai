import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS = {
  fee_reminder: '💰',
  fee_overdue: '🔴',
  fee_critical: '🚨',
  payment_success: '✅',
  app_lock: '🔒',
  live_class: '📹',
  exam_scheduled: '📝',
  exam_reminder: '⏰',
  assignment: '📋',
  certificate: '🏆',
  birthday: '🎂',
  admission_welcome: '👋',
  account_status: '👤',
  general: '📌'
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchUnread = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) setUnreadCount(res.count);
    } catch { /* ignore */ }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications(10);
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => { fetchUnread(); }, 0);
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isOpen) setTimeout(() => { fetchNotifications(); }, 0);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (!notifications.find((n) => n._id === id)?.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    setIsOpen(false);
    if (notif.link) navigate(notif.link);
  };

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-[#0b3c68] hover:underline">
                  <CheckCheck className="h-4 w-4 inline mr-0.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-slate-100">
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleClick(notif)}
                >
                  <span className="mt-0.5 text-lg flex-shrink-0">{TYPE_ICONS[notif.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold text-slate-900 truncate ${!notif.isRead ? 'text-slate-950' : ''}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif._id); }}
                        className="rounded p-0.5 hover:bg-slate-200"
                        title="Mark read"
                      >
                        <Check className="h-3 w-3 text-slate-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                      className="rounded p-0.5 hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 text-center">
            <button
              onClick={() => { setIsOpen(false); navigate(user?.role === 'student' ? '/student/notifications' : '/admin/notifications'); }}
              className="text-xs font-bold text-[#0b3c68] hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
