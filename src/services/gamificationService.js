/**
 * Gamification Service: Eco-Levels, Badges, Streaks, and Achievements
 */

const LEVELS = [
  { level: 1, name: 'Beginner', minPoints: 0, maxPoints: 199, icon: '🌱', color: '#10b981' },
  { level: 2, name: 'Green Explorer', minPoints: 200, maxPoints: 499, icon: '🌿', color: '#06b6d4' },
  { level: 3, name: 'Eco Warrior', minPoints: 500, maxPoints: 999, icon: '🛡️', color: '#3b82f6' },
  { level: 4, name: 'Carbon Reducer', minPoints: 1000, maxPoints: 1999, icon: '⚡', color: '#8b5cf6' },
  { level: 5, name: 'Sustainability Champion', minPoints: 2000, maxPoints: Infinity, icon: '👑', color: '#f59e0b' }
];

const AVAILABLE_BADGES = [
  { id: 'b1', name: 'Eco Starter', icon: '🌱', description: 'Logged your very first activity on the platform' },
  { id: 'b2', name: 'Green Hero', icon: '🦸‍♂️', description: 'Prevented over 50 kg of CO2 emissions' },
  { id: 'b3', name: 'Carbon Saver', icon: '📉', description: 'Kept daily emissions below 4 kg CO2 for 5 days' },
  { id: 'b4', name: 'Money Saver', icon: '💰', description: 'Saved over ₹3,000 using green habits' },
  { id: 'b5', name: 'Recycling Master', icon: '♻️', description: 'Diverted and recycled over 20 kg of waste' },
  { id: 'b6', name: 'Energy Efficient User', icon: '💡', description: 'Utilized over 30% solar or renewable energy' }
];

class GamificationService {
  /**
   * Determine level based on accumulated eco points
   */
  static getLevelInfo(points = 0) {
    const p = Math.max(0, parseInt(points, 10) || 0);
    const tier = LEVELS.find(l => p >= l.minPoints && p <= l.maxPoints) || LEVELS[LEVELS.length - 1];
    const nextTier = LEVELS.find(l => l.level === tier.level + 1);

    const progressToNext = nextTier
      ? Math.min(100, Math.round(((p - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
      : 100;

    return {
      currentLevel: tier.level,
      levelName: tier.name,
      points: p,
      icon: tier.icon,
      color: tier.color,
      progressToNext,
      nextLevelPoints: nextTier ? nextTier.minPoints : null,
      pointsNeeded: nextTier ? Math.max(0, nextTier.minPoints - p) : 0
    };
  }

  /**
   * Recalculate streaks, badges, achievements, and points based on user action
   */
  static evaluateProgress({
    currentGamification,
    actionType = 'log_activity',
    actionData = {},
    allActivities = [],
    allExpenses = [],
    allWaste = []
  }) {
    let points = currentGamification?.points || 0;
    let dailyStreak = currentGamification?.daily_streak || 1;
    let weeklyStreak = currentGamification?.weekly_streak || 1;
    let goalStreak = currentGamification?.goal_streak || 0;
    const badges = currentGamification?.badges ? [...currentGamification.badges] : [];
    const unlockedNow = [];

    // Award Points based on action
    if (actionType === 'log_activity') {
      points += 15;
      if (['walking', 'bike'].includes(actionData.activity_type)) {
        points += Math.round((parseFloat(actionData.distance) || 0) * 3);
      }
    } else if (actionType === 'log_energy') {
      points += 15;
      if (parseFloat(actionData.renewable_percentage) > 30) {
        points += 20;
      }
    } else if (actionType === 'log_food') {
      points += 15;
      if (actionData.food_type === 'vegan' || actionData.food_type === 'vegetarian') {
        points += 15;
      }
    } else if (actionType === 'log_waste') {
      points += 15;
      if (parseFloat(actionData.waste_reduction_score) > 60) {
        points += 25;
      }
    } else if (actionType === 'goal_completed') {
      points += 75;
      goalStreak += 1;
    }

    // Check Badges
    const hasBadge = (id) => badges.some(b => b.id === id);

    // B1: Eco Starter
    if (!hasBadge('b1') && (allActivities.length > 0 || actionType === 'log_activity')) {
      const b = AVAILABLE_BADGES.find(x => x.id === 'b1');
      badges.push({ ...b, unlocked_at: new Date().toISOString() });
      unlockedNow.push(b);
      points += 50;
    }

    // B4: Money Saver
    const totalSavings = allExpenses.reduce((sum, e) => sum + (parseFloat(e.savings_estimate) || 0), 0);
    if (!hasBadge('b4') && totalSavings >= 3000) {
      const b = AVAILABLE_BADGES.find(x => x.id === 'b4');
      badges.push({ ...b, unlocked_at: new Date().toISOString() });
      unlockedNow.push(b);
      points += 100;
    }

    // B5: Recycling Master
    const totalRecycled = allWaste.reduce((sum, w) => sum + (parseFloat(w.recycled_waste) || 0) + (parseFloat(w.composting) || 0), 0);
    if (!hasBadge('b5') && totalRecycled >= 20) {
      const b = AVAILABLE_BADGES.find(x => x.id === 'b5');
      badges.push({ ...b, unlocked_at: new Date().toISOString() });
      unlockedNow.push(b);
      points += 100;
    }

    // Evaluate Streaks
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogStr = currentGamification?.last_log_date;
    if (lastLogStr && lastLogStr !== todayStr) {
      const diffDays = Math.round((new Date(todayStr) - new Date(lastLogStr)) / 86400000);
      if (diffDays === 1) {
        dailyStreak += 1;
        if (dailyStreak % 7 === 0) {
          weeklyStreak += 1;
          points += 50; // Weekly bonus
        }
      } else if (diffDays > 1) {
        dailyStreak = 1; // streak reset
      }
    }

    const levelInfo = this.getLevelInfo(points);

    // Achievements calculation
    const totalWalkKm = allActivities
      .filter(a => a.activity_type === 'walking')
      .reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);

    const achievements = [
      { id: 'a1', title: 'First Activity Logged', completed: (allActivities.length > 0 || actionType === 'log_activity'), date: '2026-09-05' },
      { id: 'a2', title: '100 km Walked', completed: totalWalkKm >= 100, current: parseFloat(totalWalkKm.toFixed(1)), target: 100 },
      { id: 'a3', title: '30 Days Recycling', completed: allWaste.length >= 10, current: allWaste.length, target: 30 },
      { id: 'a4', title: '10% Carbon Reduction', completed: true, date: '2026-09-20' },
      { id: 'a5', title: '₹5000 Saved', completed: totalSavings >= 5000, current: Math.round(totalSavings), target: 5000 }
    ];

    return {
      points,
      level: levelInfo.currentLevel,
      level_name: levelInfo.levelName,
      daily_streak: dailyStreak,
      weekly_streak: weeklyStreak,
      goal_streak: goalStreak,
      last_log_date: todayStr,
      badges,
      achievements,
      levelInfo,
      unlockedNow
    };
  }
}

module.exports = GamificationService;
