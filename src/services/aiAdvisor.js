/**
 * AI Sustainability & Financial Optimization Advisor
 * Supports Gemini API, OpenAI API, and an expert heuristic AI reasoning engine.
 */

const axios = require('axios');
const env = require('../config/env');

class AIAdvisorService {
  /**
   * Main entry point to get comprehensive sustainability recommendations
   */
  static async getAdvice({ profile, activities = [], energyLogs = [], foodLogs = [], wasteLogs = [], expenses = [] }) {
    // 1. Analyze user data patterns
    const analysis = this.analyzePatterns({ profile, activities, energyLogs, foodLogs, wasteLogs, expenses });

    // 2. If Gemini API key is configured, attempt call
    if (env.geminiApiKey) {
      try {
        const geminiResult = await this.callGeminiAPI(analysis);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('⚠️ Gemini API call failed or quota exceeded, using Expert AI Engine:', err.message);
      }
    }

    // 3. If OpenAI API key is configured, attempt call
    if (env.openaiApiKey) {
      try {
        const openaiResult = await this.callOpenAIAPI(analysis);
        if (openaiResult) return openaiResult;
      } catch (err) {
        console.warn('⚠️ OpenAI API call failed, using Expert AI Engine:', err.message);
      }
    }

    // 4. Use Built-In Domain Expert AI Reasoning Engine
    return this.generateExpertAdvice(analysis);
  }

  /**
   * Pattern detection and aggregated profiling
   */
  static analyzePatterns({ profile, activities, energyLogs, foodLogs, wasteLogs, expenses }) {
    // Travel metrics
    const totalKm = activities.reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);
    const carActivities = activities.filter(a => a.activity_type === 'car');
    const carKm = carActivities.reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);
    const carCosts = carActivities.reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0);
    const publicKm = activities.filter(a => ['bus', 'metro', 'train'].includes(a.activity_type))
      .reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);
    const walkKm = activities.filter(a => a.activity_type === 'walking')
      .reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);

    // Energy metrics
    const avgAcHours = energyLogs.length > 0
      ? energyLogs.reduce((sum, e) => sum + (parseFloat(e.ac_hours) || 0), 0) / energyLogs.length
      : 0;
    const avgRenewablePct = energyLogs.length > 0
      ? energyLogs.reduce((sum, e) => sum + (parseFloat(e.renewable_percentage) || 0), 0) / energyLogs.length
      : 0;
    const totalElectricityUnits = energyLogs.reduce((sum, e) => sum + (parseFloat(e.electricity_units) || 0), 0);

    // Food habits
    const meatCount = foodLogs.filter(f => f.food_type === 'meat_heavy').length;
    const plantCount = foodLogs.filter(f => ['vegan', 'vegetarian'].includes(f.food_type)).length;
    const organicCount = foodLogs.filter(f => f.is_organic).length;

    // Waste metrics
    const plasticKg = wasteLogs.reduce((sum, w) => sum + (parseFloat(w.plastic_waste) || 0), 0);
    const recycledKg = wasteLogs.reduce((sum, w) => sum + (parseFloat(w.recycled_waste) || 0), 0);
    const compostKg = wasteLogs.reduce((sum, w) => sum + (parseFloat(w.composting) || 0), 0);

    // Expense metrics
    const totalSpent = expenses.reduce((sum, ex) => sum + (parseFloat(ex.amount) || 0), 0);
    const transportExpense = expenses.filter(e => e.category === 'transport')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const energyExpense = expenses.filter(e => e.category === 'electricity')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const foodExpense = expenses.filter(e => e.category === 'food')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    return {
      travel: { totalKm, carKm, carCosts, publicKm, walkKm },
      energy: { avgAcHours, avgRenewablePct, totalElectricityUnits },
      food: { meatCount, plantCount, organicCount, totalLogs: foodLogs.length },
      waste: { plasticKg, recycledKg, compostKg, totalLogs: wasteLogs.length },
      expenses: { totalSpent, transportExpense, energyExpense, foodExpense }
    };
  }

  /**
   * Deterministic Domain-Expert AI Recommendation Engine
   */
  static generateExpertAdvice(data) {
    const personalizedSuggestions = [];
    const carbonReductionTips = [];
    const ecoHabits = [];
    const weeklyChallenges = [];
    const monthlyGoals = [];
    const moneySavingSuggestions = [];
    const budgetOptimizationTips = [];

    let totalPotentialMonthlySavingsINR = 0;
    let totalPotentialMonthlyCarbonReductionKg = 0;

    // --- 1. Transport Analysis & Recommendations ---
    if (data.travel.carKm > 20) {
      const fuelSavings = Math.round(data.travel.carKm * 6.5); // ~₹6.5/km fuel saving with metro
      const co2Reduction = parseFloat((data.travel.carKm * 0.16).toFixed(1)); // difference vs metro
      totalPotentialMonthlySavingsINR += fuelSavings;
      totalPotentialMonthlyCarbonReductionKg += co2Reduction;

      personalizedSuggestions.push({
        id: 'sug-trans-1',
        title: 'Switch Commutes to Rapid Metro / Rail',
        description: `You logged ${data.travel.carKm.toFixed(1)} km in car journeys. Switching 2 round trips per week to Metro or Bus can save ~₹${fuelSavings}/month and prevent ${co2Reduction} kg of CO2.`,
        category: 'transport',
        impact: 'High',
        savingsINR: fuelSavings,
        carbonSavedKg: co2Reduction
      });
      carbonReductionTips.push('Combine multiple car errands into a single trip or carpool with colleagues.');
      weeklyChallenges.push({
        id: 'wc-1',
        title: 'Metro Commute Week',
        goal: 'Take the bus or metro at least 3 times this week.',
        rewardPoints: 40,
        estimatedSavings: '₹350'
      });
    } else {
      ecoHabits.push('Great job maintaining low private vehicle emissions! Continue walking or cycling for short distances.');
    }

    if (data.travel.walkKm < 10) {
      weeklyChallenges.push({
        id: 'wc-2',
        title: 'Step Up: 20 km Walk Challenge',
        goal: 'Walk 20 km or reach 30,000 steps across the next 7 days for errands under 1 km.',
        rewardPoints: 50,
        estimatedSavings: '₹200'
      });
    }

    // --- 2. Home Energy Analysis & Recommendations ---
    if (data.energy.avgAcHours > 3) {
      const acSavingsINR = Math.round(data.energy.avgAcHours * 30 * 18); // 1.5 units * ₹12
      const acCo2Saved = parseFloat((data.energy.avgAcHours * 30 * 0.75).toFixed(1));
      totalPotentialMonthlySavingsINR += acSavingsINR;
      totalPotentialMonthlyCarbonReductionKg += acCo2Saved;

      personalizedSuggestions.push({
        id: 'sug-energy-1',
        title: 'Optimize AC Thermostat to 24°C & Timer',
        description: `Running your air conditioner at 24°C rather than 18°C plus setting a 3-hour sleep timer reduces compressor load by 24%, saving ~₹${acSavingsINR}/month.`,
        category: 'energy',
        impact: 'Very High',
        savingsINR: acSavingsINR,
        carbonSavedKg: acCo2Saved
      });
      moneySavingSuggestions.push({
        title: 'AC Temperature Optimization',
        action: 'Raise AC temperature from 20°C to 24°C',
        savingEstimate: `₹${Math.round(acSavingsINR * 0.4)} - ₹${acSavingsINR}/month`,
        carbonImpact: `${acCo2Saved} kg CO2/month`
      });
    }

    if (data.energy.avgRenewablePct < 20) {
      personalizedSuggestions.push({
        id: 'sug-energy-2',
        title: 'Explore Rooftop Solar Subsidy & Green Tariffs',
        description: 'Under national solar rooftop schemes, a 2kW system cuts residential electricity bills by up to 80% with an ROI under 3.5 years.',
        category: 'energy',
        impact: 'High',
        savingsINR: 1800,
        carbonSavedKg: 95.0
      });
    }

    // --- 3. Food Habits ---
    if (data.food.meatCount > 0) {
      const foodSaving = 1200;
      totalPotentialMonthlySavingsINR += foodSaving;
      totalPotentialMonthlyCarbonReductionKg += 32;

      personalizedSuggestions.push({
        id: 'sug-food-1',
        title: 'Adopt "Meatless Mondays" & Plant-Forward Dinners',
        description: 'Swapping meat for lentils, paneer, chickpeas, or tofu just 2 days a week saves ~₹1,200/month on grocery bills and cuts 32 kg CO2.',
        category: 'food',
        impact: 'Medium',
        savingsINR: foodSaving,
        carbonSavedKg: 32.0
      });
      weeklyChallenges.push({
        id: 'wc-3',
        title: 'Green Plate Challenge',
        goal: 'Log 5 consecutive days of vegetarian or vegan meals.',
        rewardPoints: 45,
        estimatedSavings: '₹400'
      });
    }

    // --- 4. Waste & Recycling Habits ---
    if (data.waste.plasticKg > 0.5) {
      personalizedSuggestions.push({
        id: 'sug-waste-1',
        title: 'Ditch Single-Use Plastics: Switch to Reusable Essentials',
        description: 'Carrying a stainless-steel bottle and canvas grocery bags prevents ~25 single-use plastic items per month and saves ₹400-800 on packaged bottled water.',
        category: 'waste',
        impact: 'Medium',
        savingsINR: 500,
        carbonSavedKg: 12.5
      });
      ecoHabits.push('Keep a folded cotton bag in your backpack or vehicle for impromptu purchases.');
    }

    if (data.waste.compostKg === 0) {
      carbonReductionTips.push('Start kitchen counter composting for organic scraps to prevent methane emissions from landfills.');
    }

    // --- 5. Money-Saving & Financial Sustainability Opportunities ---
    moneySavingSuggestions.push(
      {
        title: 'Public Transit Smart Card',
        action: 'Buy monthly metro pass instead of daily cab bookings',
        savingEstimate: '₹1,500 - ₹3,000 / month',
        carbonImpact: '25-40 kg CO2 avoided'
      },
      {
        title: 'Smart Power Strips & Vampire Load Elimination',
        action: 'Turn off standby switches for TV, microwave, and monitors',
        savingEstimate: '₹250 - ₹450 / month',
        carbonImpact: '15 kg CO2 avoided'
      },
      {
        title: 'Local & Seasonal Produce Sourcing',
        action: 'Shop at weekly Rythu Bazaars / farmers markets rather than imported supermarket goods',
        savingEstimate: '₹800 - ₹1,400 / month',
        carbonImpact: '18 kg CO2 avoided'
      }
    );

    budgetOptimizationTips.push(
      'Reinvest monthly energy savings (avg ₹1,500) into higher quality energy-star appliances.',
      'Audit water and electricity tariffs: shifting washing machine cycles to off-peak afternoon solar hours reduces billing tier rates.',
      'Opt for certified refurbished electronics instead of new flagships to save up to 45% capital cost and avoid 60kg e-waste emissions.'
    );

    monthlyGoals.push(
      {
        title: 'Cap Monthly Transport Carbon under 40 kg CO2',
        metric: 'Travel emissions',
        target: '40 kg CO2',
        duration: '30 Days'
      },
      {
        title: 'Achieve 70% Home Waste Diversion (Recycled + Composted)',
        metric: 'Waste reduction score',
        target: '70%',
        duration: '30 Days'
      },
      {
        title: 'Save ₹3,500 Through Sustainable Lifestyle Tweaks',
        metric: 'Net monthly savings',
        target: '₹3,500',
        duration: '30 Days'
      }
    );

    // Future Emission Forecast Simulation (Next 3 Months)
    const currentBaselineMonthly = 180; // kg CO2
    const forecasts = [
      {
        month: 'Current Month',
        projectedEmission: currentBaselineMonthly,
        status: 'Baseline'
      },
      {
        month: 'Next Month (With AI Tips)',
        projectedEmission: Math.max(80, Math.round(currentBaselineMonthly - totalPotentialMonthlyCarbonReductionKg * 0.6)),
        status: 'Projected -18%'
      },
      {
        month: 'Month 3 (Full Adoption)',
        projectedEmission: Math.max(65, Math.round(currentBaselineMonthly - totalPotentialMonthlyCarbonReductionKg)),
        status: 'Projected -35%'
      }
    ];

    return {
      source: 'EcoSphere AI Sustainability Intelligence Engine',
      generatedAt: new Date().toISOString(),
      summary: {
        totalPotentialMonthlySavingsINR,
        totalPotentialMonthlyCarbonReductionKg,
        overallSustainabilityGrade: totalPotentialMonthlyCarbonReductionKg > 50 ? 'A - High Potential' : 'B+ Steady Progress'
      },
      personalizedSuggestions,
      carbonReductionTips,
      ecoHabits,
      weeklyChallenges,
      monthlyGoals,
      moneySavingSuggestions,
      budgetOptimizationTips,
      forecasts
    };
  }

  /**
   * Optional Gemini API integration
   */
  static async callGeminiAPI(analysis) {
    const prompt = `You are a Senior Sustainability Architect and Financial Optimization Expert. Analyze this user data:\n${JSON.stringify(analysis, null, 2)}\nReturn actionable recommendations, carbon reduction tips, weekly challenges, and money-saving opportunities with estimated INR savings. Format your response strictly as valid JSON matching the advisor schema.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      },
      { timeout: 8000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  }

  /**
   * Optional OpenAI API integration
   */
  static async callOpenAIAPI(analysis) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an elite Sustainability Engineer & Personal Finance Advisor. Return clean JSON containing personalizedSuggestions, carbonReductionTips, ecoHabits, weeklyChallenges, monthlyGoals, moneySavingSuggestions, budgetOptimizationTips, forecasts.'
          },
          {
            role: 'user',
            content: JSON.stringify(analysis)
          }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: { Authorization: `Bearer ${env.openaiApiKey}` },
        timeout: 8000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return null;
  }
}

module.exports = AIAdvisorService;
