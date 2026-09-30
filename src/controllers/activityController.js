const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const CarbonCalculator = require('../services/carbonCalculator');
const GamificationService = require('../services/gamificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ActivityController {
  /**
   * Log an environmental travel activity
   */
  static async logActivity(req, res, next) {
    try {
      const {
        activity_type,
        distance,
        duration,
        steps,
        fuel_type,
        fuel_consumed,
        cost,
        date,
        notes
      } = req.body;

      const userId = req.user.id;
      const dist = parseFloat(distance) || 0;

      // 1. Calculate carbon emission
      const carbonEmission = CarbonCalculator.calculateActivityEmission({
        activity_type,
        distance: dist,
        fuel_type,
        fuel_consumed
      });

      // 2. Insert into activities
      const newActivity = {
        id: uuidv4(),
        user_id: userId,
        activity_type,
        distance: dist,
        duration: parseFloat(duration) || 0,
        steps: parseInt(steps, 10) || (activity_type === 'walking' ? Math.round(dist * 1350) : 0),
        fuel_type: fuel_type || (activity_type === 'car' ? 'petrol' : 'none'),
        fuel_consumed: parseFloat(fuel_consumed) || 0,
        cost: parseFloat(cost) || 0,
        carbon_emission: carbonEmission,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      const { data: insertedActivity } = await supabase.from('activities').insert(newActivity);

      // If cost is specified and > 0, also log into expenses automatically
      if (newActivity.cost > 0) {
        const isSustainable = ['metro', 'bus', 'train', 'shared_ride', 'bike'].includes(activity_type);
        // Estimate savings compared to taking a private taxi
        const taxiBaselineCost = Math.round(dist * 18);
        const savings = isSustainable ? Math.max(0, taxiBaselineCost - newActivity.cost) : 0;

        await supabase.from('expenses').insert({
          id: uuidv4(),
          user_id: userId,
          category: 'transport',
          amount: newActivity.cost,
          date: newActivity.date,
          description: `${activity_type.toUpperCase()} trip: ${dist} km`,
          is_sustainable: isSustainable,
          savings_estimate: savings,
          created_at: new Date().toISOString()
        });
      }

      // 3. Update Gamification points & check achievements
      const { data: currentGamification } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: allActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId);

      const gamificationUpdate = GamificationService.evaluateProgress({
        currentGamification,
        actionType: 'log_activity',
        actionData: newActivity,
        allActivities: allActivities || [newActivity]
      });

      await supabase
        .from('gamification')
        .update(gamificationUpdate)
        .eq('user_id', userId);

      return successResponse(res, {
        activity: insertedActivity || newActivity,
        gamification: gamificationUpdate
      }, 'Activity logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all activities for current user
   */
  static async getActivities(req, res, next) {
    try {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch activities', 500, error);
      }

      return successResponse(res, activities || [], 'Activities retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete an activity
   */
  static async deleteActivity(req, res, next) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) {
        return errorResponse(res, 'Failed to delete activity', 500, error);
      }

      return successResponse(res, null, 'Activity deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ActivityController;
