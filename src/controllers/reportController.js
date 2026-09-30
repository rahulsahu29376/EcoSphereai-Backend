const { supabase } = require('../config/supabase');
const ReportGeneratorService = require('../services/reportGenerator');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ReportController {
  /**
   * Get period report
   */
  static async getReport(req, res, next) {
    try {
      const { period = 'monthly' } = req.query; // daily, weekly, monthly, annual
      const userId = req.user.id;

      const [
        { data: activities },
        { data: energyLogs },
        { data: foodLogs },
        { data: wasteLogs },
        { data: goals },
        { data: expenses }
      ] = await Promise.all([
        supabase.from('activities').select('*').eq('user_id', userId),
        supabase.from('energy_usage').select('*').eq('user_id', userId),
        supabase.from('food_consumption').select('*').eq('user_id', userId),
        supabase.from('waste_management').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId)
      ]);

      const report = ReportGeneratorService.generateReport({
        period,
        user: req.user,
        activities: activities || [],
        energyLogs: energyLogs || [],
        foodLogs: foodLogs || [],
        wasteLogs: wasteLogs || [],
        goals: goals || [],
        expenses: expenses || []
      });

      return successResponse(res, report, `${period.toUpperCase()} report generated`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Export report as downloadable CSV
   */
  static async exportCSV(req, res, next) {
    try {
      const { period = 'monthly' } = req.query;
      const userId = req.user.id;

      const [
        { data: activities },
        { data: energyLogs },
        { data: foodLogs },
        { data: wasteLogs },
        { data: goals },
        { data: expenses }
      ] = await Promise.all([
        supabase.from('activities').select('*').eq('user_id', userId),
        supabase.from('energy_usage').select('*').eq('user_id', userId),
        supabase.from('food_consumption').select('*').eq('user_id', userId),
        supabase.from('waste_management').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId)
      ]);

      const report = ReportGeneratorService.generateReport({
        period,
        user: req.user,
        activities: activities || [],
        energyLogs: energyLogs || [],
        foodLogs: foodLogs || [],
        wasteLogs: wasteLogs || [],
        goals: goals || [],
        expenses: expenses || []
      });

      const csvContent = ReportGeneratorService.exportToCSV(report);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sustainability-report-${period}-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
