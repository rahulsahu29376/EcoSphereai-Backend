const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const CarbonCalculator = require('../services/carbonCalculator');
const GamificationService = require('../services/gamificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class FoodController {
  /**
   * Log food consumption habits
   */
  static async logFood(req, res, next) {
    try {
      const {
        food_type,
        meals_per_day,
        food_spending,
        is_organic,
        is_local,
        date,
        notes
      } = req.body;

      const userId = req.user.id;

      // Calculate carbon emissions
      const carbonEmission = CarbonCalculator.calculateFoodEmission({
        food_type,
        meals_per_day,
        is_organic,
        is_local
      });

      const newFoodLog = {
        id: uuidv4(),
        user_id: userId,
        food_type,
        meals_per_day: parseInt(meals_per_day, 10) || 3,
        food_spending: parseFloat(food_spending) || 0,
        is_organic: Boolean(is_organic),
        is_local: Boolean(is_local),
        carbon_emission: carbonEmission,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || '',
        created_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase.from('food_consumption').insert(newFoodLog);

      // Track expense if spending entered
      if (newFoodLog.food_spending > 0) {
        const isPlantBased = ['vegetarian', 'vegan'].includes(food_type);
        const estimatedSavings = isPlantBased ? Math.round(newFoodLog.food_spending * 0.25) : 0;

        await supabase.from('expenses').insert({
          id: uuidv4(),
          user_id: userId,
          category: 'food',
          amount: newFoodLog.food_spending,
          date: newFoodLog.date,
          description: `${food_type.toUpperCase()} Meals (${newFoodLog.meals_per_day}/day)${is_local ? ' - Local Sourced' : ''}`,
          is_sustainable: isPlantBased || is_organic || is_local,
          savings_estimate: estimatedSavings,
          created_at: new Date().toISOString()
        });
      }

      // Update gamification
      const { data: currentGamification } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      const gamificationUpdate = GamificationService.evaluateProgress({
        currentGamification,
        actionType: 'log_food',
        actionData: newFoodLog
      });

      await supabase
        .from('gamification')
        .update(gamificationUpdate)
        .eq('user_id', userId);

      return successResponse(res, {
        foodLog: inserted || newFoodLog,
        gamification: gamificationUpdate
      }, 'Food consumption logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get food consumption history
   */
  static async getFoodLogs(req, res, next) {
    try {
      const { data: logs, error } = await supabase
        .from('food_consumption')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch food logs', 500, error);
      }

      return successResponse(res, logs || [], 'Food logs retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FoodController;
