const { supabase } = require('../config/supabase');
const GamificationService = require('../services/gamificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class GamificationController {
  /**
   * Get user gamification status, levels, badges, streaks, and achievements
   */
  static async getStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { data: gamification } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      const points = gamification?.points || 0;
      const levelInfo = GamificationService.getLevelInfo(points);

      return successResponse(res, {
        ...gamification,
        levelInfo
      }, 'Gamification status retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GamificationController;
