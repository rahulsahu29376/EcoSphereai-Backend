const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const GamificationService = require('../services/gamificationService');
const NotificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class GoalController {
  /**
   * Create a new sustainability goal
   */
  static async createGoal(req, res, next) {
    try {
      const { goal_name, category, target, unit, deadline } = req.body;
      const userId = req.user.id;

      const newGoal = {
        id: uuidv4(),
        user_id: userId,
        goal_name,
        category,
        target: parseFloat(target),
        progress: 0.0,
        unit,
        deadline: deadline || null,
        status: 'in_progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase.from('goals').insert(newGoal);

      return successResponse(res, inserted || newGoal, 'Goal created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all goals for current user
   */
  static async getGoals(req, res, next) {
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch goals', 500, error);
      }

      // Add completion percentage dynamically
      const formattedGoals = (goals || []).map(g => {
        const target = parseFloat(g.target) || 1;
        const progress = parseFloat(g.progress) || 0;
        const completionPct = Math.min(100, Math.round((progress / target) * 100));
        return {
          ...g,
          completionPercentage: completionPct
        };
      });

      return successResponse(res, formattedGoals, 'Goals retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update goal progress
   */
  static async updateProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      const userId = req.user.id;

      const { data: goal } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!goal) {
        return errorResponse(res, 'Goal not found', 404);
      }

      const newProgress = parseFloat(progress);
      const isCompleted = newProgress >= parseFloat(goal.target);
      const newStatus = isCompleted ? 'completed' : goal.status;

      const { data: updated } = await supabase
        .from('goals')
        .update({
          progress: newProgress,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      // If newly completed, award gamification bonus & send notification
      if (isCompleted && goal.status !== 'completed') {
        const { data: currentGamification } = await supabase
          .from('gamification')
          .select('*')
          .eq('user_id', userId)
          .single();

        const gamificationUpdate = GamificationService.evaluateProgress({
          currentGamification,
          actionType: 'goal_completed',
          actionData: { ...goal, progress: newProgress }
        });

        await supabase
          .from('gamification')
          .update(gamificationUpdate)
          .eq('user_id', userId);

        await NotificationService.createNotification({
          userId,
          title: '🎉 Goal Accomplished!',
          message: `Awesome work! You completed your goal "${goal.goal_name}". +75 Eco Points awarded!`,
          type: 'achievement'
        });
      }

      return successResponse(res, updated, 'Goal progress updated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete goal
   */
  static async deleteGoal(req, res, next) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) {
        return errorResponse(res, 'Failed to delete goal', 500, error);
      }

      return successResponse(res, null, 'Goal deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GoalController;
