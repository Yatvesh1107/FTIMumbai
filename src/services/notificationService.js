import { apiRequest } from '../utils/api';

const notificationService = {
  // Get my notifications (bell dropdown)
  getMyNotifications: async (limit = 20, filters = {}) => {
    const params = new URLSearchParams({ limit: String(limit), ...filters });
    return apiRequest('/notifications/my?' + params.toString());
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count');
  },

  // Mark single as read
  markAsRead: async (id) => {
    return apiRequest('/notifications/' + id + '/read', 'PUT');
  },

  // Mark all as read
  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read', 'PUT');
  },

  // Delete notification
  deleteNotification: async (id) => {
    return apiRequest('/notifications/' + id, 'DELETE');
  },

  // Dismiss (remind later)
  dismiss: async (id) => {
    return apiRequest('/notifications/' + id + '/dismiss', 'PUT');
  },

  // Get all notifications (admin)
  getAllNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest('/notifications?' + query);
  },

  // Broadcast (admin)
  broadcast: async (data) => {
    return apiRequest('/notifications/broadcast', 'POST', data);
  },

  // Get VAPID key
  getVapidKey: async () => {
    return apiRequest('/notifications/vapid-key');
  },

  // Subscribe push
  subscribePush: async (subscription) => {
    return apiRequest('/notifications/subscribe', 'POST', {
      subscription,
      userAgent: navigator.userAgent
    });
  },

  // Unsubscribe push
  unsubscribePush: async () => {
    return apiRequest('/notifications/unsubscribe', 'POST');
  }
};

export default notificationService;
