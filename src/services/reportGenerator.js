/**
 * Sustainability & Financial Reporting Engine
 * Generates Daily, Weekly, Monthly, and Annual reports with CSV export and trend aggregations.
 */

const CarbonCalculator = require('./carbonCalculator');

class ReportGeneratorService {
  /**
   * Filter records within timeframe
   */
  static filterByTimeframe(records = [], period = 'monthly') {
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 86400000);
    } else if (period === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 86400000);
    } else if (period === 'annual') {
      startDate = new Date(now.getTime() - 365 * 86400000);
    }

    return records.filter(item => {
      const itemDate = new Date(item.date || item.created_at);
      return itemDate >= startDate;
    });
  }

  /**
   * Build complete period report
   */
  static generateReport({
    period = 'monthly',
    user,
    activities = [],
    energyLogs = [],
    foodLogs = [],
    wasteLogs = [],
    goals = [],
    expenses = []
  }) {
    const filteredActivities = this.filterByTimeframe(activities, period);
    const filteredEnergy = this.filterByTimeframe(energyLogs, period);
    const filteredFood = this.filterByTimeframe(foodLogs, period);
    const filteredWaste = this.filterByTimeframe(wasteLogs, period);
    const filteredExpenses = this.filterByTimeframe(expenses, period);

    const carbonMetrics = CarbonCalculator.calculateAggregates({
      activities: filteredActivities,
      energyLogs: filteredEnergy,
      foodLogs: filteredFood,
      wasteLogs: filteredWaste
    });

    // Expenses & Savings
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const moneySaved = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.savings_estimate) || 0), 0);

    // Goal Completion rate
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed' || (g.progress >= g.target)).length;
    const goalSuccessRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Green Mobility Stats
    const walkDistance = filteredActivities
      .filter(a => a.activity_type === 'walking')
      .reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);
    const totalSteps = filteredActivities.reduce((sum, a) => sum + (parseInt(a.steps, 10) || 0), 0);
    const avoidedDrivingCo2 = CarbonCalculator.calculateAvoidedActivityEmission(walkDistance);

    // Trend grouping by date
    const dateMap = {};
    [...filteredActivities, ...filteredEnergy, ...filteredFood].forEach(item => {
      const d = item.date || item.created_at?.split('T')[0];
      if (!d) return;
      if (!dateMap[d]) dateMap[d] = { date: d, carbon: 0, expenses: 0 };
      dateMap[d].carbon += parseFloat(item.carbon_emission) || 0;
    });

    filteredExpenses.forEach(item => {
      const d = item.date || item.created_at?.split('T')[0];
      if (!d) return;
      if (!dateMap[d]) dateMap[d] = { date: d, carbon: 0, expenses: 0 };
      dateMap[d].expenses += parseFloat(item.amount) || 0;
    });

    const trends = Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(t => ({
        date: t.date,
        carbonKg: parseFloat(t.carbon.toFixed(2)),
        expenseINR: parseFloat(t.expenses.toFixed(2))
      }));

    return {
      period,
      generatedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      },
      summary: {
        totalCarbonFootprintKg: carbonMetrics.totalCarbonKg,
        sustainabilityScore: carbonMetrics.sustainabilityScore,
        totalExpensesINR: parseFloat(totalExpenses.toFixed(2)),
        moneySavedINR: parseFloat(moneySaved.toFixed(2)),
        avoidedCarbonKg: avoidedDrivingCo2,
        activeDaysCount: trends.length
      },
      emissionsBreakdown: carbonMetrics.breakdown,
      mobility: {
        walkingKm: parseFloat(walkDistance.toFixed(2)),
        stepsTaken: totalSteps,
        avoidedEmissionsKg: avoidedDrivingCo2
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        successRate: goalSuccessRate,
        items: goals
      },
      emissionTrends: trends
    };
  }

  /**
   * Convert activity/carbon dataset to clean CSV format
   */
  static exportToCSV(report) {
    const lines = [];
    lines.push(`"Report Type","${report.period.toUpperCase()} SUSTAINABILITY REPORT"`);
    lines.push(`"Generated At","${report.generatedAt}"`);
    lines.push(`"User Name","${report.user.name}"`);
    lines.push(`"Sustainability Score","${report.summary.sustainabilityScore}/100"`);
    lines.push(`"Total Carbon Footprint (kg CO2)","${report.summary.totalCarbonFootprintKg}"`);
    lines.push(`"Total Expenses (INR)","₹${report.summary.totalExpensesINR}"`);
    lines.push(`"Estimated Money Saved (INR)","₹${report.summary.moneySavedINR}"`);
    lines.push('');
    lines.push('"Date","Carbon Emission (kg CO2)","Daily Expenses (INR)"');

    report.emissionTrends.forEach(trend => {
      lines.push(`"${trend.date}","${trend.carbonKg}","${trend.expenseINR}"`);
    });

    return lines.join('\n');
  }
}

module.exports = ReportGeneratorService;
