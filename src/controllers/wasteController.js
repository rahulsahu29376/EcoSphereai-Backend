const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const CarbonCalculator = require('../services/carbonCalculator');
const GamificationService = require('../services/gamificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class WasteController {
  /**
   * Log waste generation and recycling actions
   */
  static async logWaste(req, res, next) {
    try {
      const {
        plastic_waste,
        recycled_waste,
        composting,
        paper_waste,
        electronic_waste,
        date
      } = req.body;

      const userId = req.user.id;

      // Calculate reduction score and carbon offset
      const metrics = CarbonCalculator.calculateWasteMetrics({
        plastic_waste,
        recycled_waste,
        composting,
        paper_waste,
        electronic_waste
      });

      const newWasteLog = {
        id: uuidv4(),
        user_id: userId,
        plastic_waste: parseFloat(plastic_waste) || 0,
        recycled_waste: parseFloat(recycled_waste) || 0,
        composting: parseFloat(composting) || 0,
        paper_waste: parseFloat(paper_waste) || 0,
        electronic_waste: parseFloat(electronic_waste) || 0,
        waste_reduction_score: metrics.waste_reduction_score,
        carbon_offset: metrics.carbon_offset,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase.from('waste_management').insert(newWasteLog);

      // Update gamification
      const { data: currentGamification } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: allWaste } = await supabase
        .from('waste_management')
        .select('*')
        .eq('user_id', userId);

      const gamificationUpdate = GamificationService.evaluateProgress({
        currentGamification,
        actionType: 'log_waste',
        actionData: newWasteLog,
        allWaste: allWaste || [newWasteLog]
      });

      await supabase
        .from('gamification')
        .update(gamificationUpdate)
        .eq('user_id', userId);

      return successResponse(res, {
        wasteLog: inserted || newWasteLog,
        gamification: gamificationUpdate
      }, 'Waste management logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all waste logs
   */
  static async getWasteLogs(req, res, next) {
    try {
      const { data: logs, error } = await supabase
        .from('waste_management')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch waste logs', 500, error);
      }

      return successResponse(res, logs || [], 'Waste logs retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WasteController;
