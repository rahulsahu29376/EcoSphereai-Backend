const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const CarbonCalculator = require('../services/carbonCalculator');
const GamificationService = require('../services/gamificationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class EnergyController {
  /**
   * Log home energy consumption
   */
  static async logEnergy(req, res, next) {
    try {
      const {
        electricity_units,
        ac_hours,
        fan_hours,
        appliance_usage,
        solar_energy,
        renewable_percentage,
        cost,
        date
      } = req.body;

      const userId = req.user.id;

      // Calculate carbon emissions
      const carbonEmission = CarbonCalculator.calculateEnergyEmission({
        electricity_units,
        ac_hours,
        fan_hours,
        solar_energy,
        renewable_percentage
      });

      const newEnergyLog = {
        id: uuidv4(),
        user_id: userId,
        electricity_units: parseFloat(electricity_units) || 0,
        ac_hours: parseFloat(ac_hours) || 0,
        fan_hours: parseFloat(fan_hours) || 0,
        appliance_usage: appliance_usage || {},
        solar_energy: parseFloat(solar_energy) || 0,
        renewable_percentage: parseFloat(renewable_percentage) || 0,
        carbon_emission: carbonEmission,
        cost: parseFloat(cost) || 0,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase.from('energy_usage').insert(newEnergyLog);

      // If cost is specified, track expense
      if (newEnergyLog.cost > 0) {
        // Calculate estimated savings from solar/renewables
        const solarKwh = parseFloat(solar_energy) || 0;
        const savingsEst = Math.round(solarKwh * 8.5); // avg ₹8.5/unit solar savings

        await supabase.from('expenses').insert({
          id: uuidv4(),
          user_id: userId,
          category: 'electricity',
          amount: newEnergyLog.cost,
          date: newEnergyLog.date,
          description: `Home Electricity: ${newEnergyLog.electricity_units} kWh (${newEnergyLog.renewable_percentage}% Green)`,
          is_sustainable: newEnergyLog.renewable_percentage > 25,
          savings_estimate: savingsEst,
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
        actionType: 'log_energy',
        actionData: newEnergyLog
      });

      await supabase
        .from('gamification')
        .update(gamificationUpdate)
        .eq('user_id', userId);

      return successResponse(res, {
        energyLog: inserted || newEnergyLog,
        gamification: gamificationUpdate
      }, 'Energy consumption logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all energy logs for current user
   */
  static async getEnergyLogs(req, res, next) {
    try {
      const { data: logs, error } = await supabase
        .from('energy_usage')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch energy logs', 500, error);
      }

      return successResponse(res, logs || [], 'Energy records retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EnergyController;
