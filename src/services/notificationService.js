/**
 * Notification Service: Event-driven alerts and sustainability triggers
 */

const { supabase, isMock } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async createNotification({ userId, title, message, type = 'info' }) {
    try {
      const payload = {
        id: uuidv4(),
        user_id: userId,
        title,
        message,
        type, // 'reminder', 'goal', 'carbon_alert', 'report', 'achievement', 'money'
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('notifications').insert(payload);
      return data;
    } catch (err) {
      console.warn('Failed to insert notification:', err.message);
      return null;
    }
  }

  /**
   * Check & trigger periodic or event-driven alerts
   */
  static async checkSmartAlerts(userId) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Check if activity is logged today
      const { data: todayActivities } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', userId)
        .eq('date', todayStr);

      if (!todayActivities || todayActivities.length === 0) {
        // Notification for missing log
        await this.createNotification({
          userId,
          title: '📝 Log Today\'s Eco Activities',
          message: 'Keep your 6-day streak alive! Record your daily commute, meals, or home energy usage.',
          type: 'reminder'
        });
      }

      // 2. Check for goals with approaching deadlines (within 3 days)
      const { data: userGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress');

      if (userGoals) {
        userGoals.forEach(async (goal) => {
          if (goal.deadline) {
            const deadlineTime = new Date(goal.deadline).getTime();
            const daysLeft = Math.ceil((deadlineTime - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft >= 0 && daysLeft <= 3) {
              await this.createNotification({
                userId,
                title: `⏳ Goal Deadline Approaching: "${goal.goal_name}"`,
                message: `Only ${daysLeft === 0 ? 'today' : daysLeft + ' days'} left to complete your goal! Current progress: ${goal.progress} / ${goal.target} ${goal.unit}.`,
                type: 'goal'
              });
            }
          }
        });
      }
    } catch (err) {
      console.warn('Notification smart alert check error:', err.message);
    }
  }
}

module.exports = NotificationService;
