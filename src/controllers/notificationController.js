const { supabase } = require('../config/supabase');
const NotificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class NotificationController {
  /**
   * Get all notifications for current user (also evaluates smart alerts)
   */
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;

      // Check smart alerts dynamically (e.g. approaching deadlines or missing daily log)
      await NotificationService.checkSmartAlerts(userId);

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch notifications', 500, error);
      }

      const unreadCount = (notifications || []).filter(n => !n.is_read).length;

      return successResponse(res, {
        unreadCount,
        notifications: notifications || []
      }, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark a specific notification as read
   */
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const { data: updated, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) {
        return errorResponse(res, 'Failed to update notification', 500, error);
      }

      return successResponse(res, updated, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req, res, next) {
    try {
      const { data: updated, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.user.id);

      if (error) {
        return errorResponse(res, 'Failed to mark all as read', 500, error);
      }

      return successResponse(res, updated, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
