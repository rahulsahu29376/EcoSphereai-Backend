const { supabase } = require('../config/supabase');
const AIAdvisorService = require('../services/aiAdvisor');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class AIController {
  /**
   * Generate holistic AI recommendations based on user activities and expenses
   */
  static async getAdvice(req, res, next) {
    try {
      const userId = req.user.id;

      // Fetch user profile and logs
      const [
        { data: activities },
        { data: energyLogs },
        { data: foodLogs },
        { data: wasteLogs },
        { data: expenses }
      ] = await Promise.all([
        supabase.from('activities').select('*').eq('user_id', userId),
        supabase.from('energy_usage').select('*').eq('user_id', userId),
        supabase.from('food_consumption').select('*').eq('user_id', userId),
        supabase.from('waste_management').select('*').eq('user_id', userId),
        supabase.from('expenses').select('*').eq('user_id', userId)
      ]);

      const advice = await AIAdvisorService.getAdvice({
        profile: req.user,
        activities: activities || [],
        energyLogs: energyLogs || [],
        foodLogs: foodLogs || [],
        wasteLogs: wasteLogs || [],
        expenses: expenses || []
      });

      return successResponse(res, advice, 'AI Sustainability Advice generated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Interactive AI Advisor Chat Assistant
   */
  static async chat(req, res, next) {
    try {
      const { message } = req.body;
      if (!message || !message.trim()) {
        return errorResponse(res, 'Message text is required', 400);
      }

      const query = message.toLowerCase();
      let reply = '';
      let category = 'general';
      let estimatedSavings = '₹500 - ₹2,000/mo';

      if (query.includes('commute') || query.includes('car') || query.includes('metro') || query.includes('petrol') || query.includes('travel')) {
        category = 'transport';
        reply = `🚗 **Commute Optimization Tip**: Switching from daily solo car driving to the metro or bus for just 3 days a week cuts ~35 kg of CO₂ and saves approximately ₹2,400 to ₹3,600 every month in fuel and parking fees. For trips under 2 km, brisk walking or cycling eliminates 100% of emissions!`;
        estimatedSavings = '₹2,400 - ₹3,600/mo';
      } else if (query.includes('ac') || query.includes('electricity') || query.includes('bill') || query.includes('solar') || query.includes('power')) {
        category = 'energy';
        reply = `⚡ **Home Energy & Bill Reduction**: Setting your AC temperature to 24°C instead of 18°C lowers compressor power consumption by 24%, saving ~₹900 - ₹1,500/month. Also, switching out remaining incandescent or CFL bulbs for 9W LED fixtures yields an immediate 80% lighting power drop!`;
        estimatedSavings = '₹900 - ₹1,500/mo';
      } else if (query.includes('diet') || query.includes('food') || query.includes('meat') || query.includes('vegan') || query.includes('organic')) {
        category = 'food';
        reply = `🥗 **Eco-Food Savings**: Plant-based protein sources like lentils, chickpeas, and seasonal vegetables generate 70% less greenhouse gas emissions than red meat, while trimming 20-30% off your grocery bill. Choosing local seasonal produce also avoids long-haul cold-chain storage emissions.`;
        estimatedSavings = '₹1,200 - ₹2,000/mo';
      } else if (query.includes('plastic') || query.includes('waste') || query.includes('recycle') || query.includes('compost')) {
        category = 'waste';
        reply = `♻️ **Zero Waste Blueprint**: Diverting organic kitchen scraps into a simple balcony composting bin prevents methane generation in landfills. Carrying a reusable flask and steel tiffin eliminates single-use plastics and saves ~₹400/month on bottled beverages.`;
        estimatedSavings = '₹400 - ₹800/mo';
      } else {
        reply = `🌱 **EcoSphere AI Insight**: Living sustainably is one of the highest-return investments you can make. By pairing renewable energy adoption, public transit smart passes, and plant-forward dining, urban households routinely reduce emissions by 40% while unlocking over ₹5,000 in monthly pocket savings!`;
      }

      return successResponse(res, {
        reply,
        category,
        estimatedSavings,
        timestamp: new Date().toISOString()
      }, 'AI response generated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AIController;
