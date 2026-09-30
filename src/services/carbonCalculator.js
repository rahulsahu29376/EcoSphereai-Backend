/**
 * Carbon Footprint Calculation Engine
 * Implements IPCC & GHG Protocol based emission factors and reduction algorithms.
 */

const EMISSION_FACTORS = {
  // Travel: kg CO2 per km
  transport: {
    car: {
      petrol: 0.21,
      diesel: 0.19,
      electric: 0.05,
      hybrid: 0.12,
      default: 0.21
    },
    bike: {
      bicycle: 0.0,
      motorbike: 0.09,
      electric: 0.015,
      default: 0.0
    },
    public: {
      bus: 0.10,
      metro: 0.05,
      train: 0.04,
      shared_ride: 0.08,
      default: 0.08
    },
    walking: 0.0,
    flight: 0.25
  },

  // Energy: kg CO2 per kWh
  energy: {
    grid_electricity_per_kwh: 0.72,
    ac_kw_estimate: 1.5,      // avg 1.5 kW per AC unit hour
    fan_kw_estimate: 0.075,   // avg 75 Watts per ceiling fan hour
  },

  // Food: kg CO2 per day / meal
  food: {
    vegan: 1.0,         // per day base
    vegetarian: 1.5,
    mixed: 3.2,
    meat_heavy: 5.0,
    organic_discount: 0.10, // 10% reduction for organic farming
    local_discount: 0.15,   // 15% reduction for local sourcing
  },

  // Waste: kg CO2 impact per kg waste
  waste: {
    plastic: 2.5,
    recycled_offset: 1.2, // avoided CO2 per kg recycled
    composting_offset: 0.8, // avoided CO2 per kg composted
    paper: 1.1,
    electronic: 15.0,
  }
};

class CarbonCalculator {
  /**
   * Calculate travel carbon footprint in kg CO2
   */
  static calculateActivityEmission({ activity_type, distance = 0, fuel_type = 'petrol', fuel_consumed = 0 }) {
    const dist = parseFloat(distance) || 0;
    const type = (activity_type || '').toLowerCase();

    let emission = 0;

    if (type === 'car') {
      const factor = EMISSION_FACTORS.transport.car[fuel_type] || EMISSION_FACTORS.transport.car.default;
      emission = dist * factor;
    } else if (type === 'bike') {
      const factor = EMISSION_FACTORS.transport.bike[fuel_type] || EMISSION_FACTORS.transport.bike.default;
      emission = dist * factor;
    } else if (['bus', 'metro', 'train', 'shared_ride'].includes(type)) {
      const factor = EMISSION_FACTORS.transport.public[type] || EMISSION_FACTORS.transport.public.default;
      emission = dist * factor;
    } else if (type === 'walking') {
      emission = 0.0;
    } else if (type === 'flight') {
      emission = dist * EMISSION_FACTORS.transport.flight;
    } else {
      emission = dist * 0.15; // default fallback factor
    }

    return parseFloat(emission.toFixed(4));
  }

  /**
   * Calculate Avoided Emissions (Green Savings) for walking or cycling instead of driving
   */
  static calculateAvoidedActivityEmission(distance = 0) {
    const dist = parseFloat(distance) || 0;
    // Difference between baseline car petrol (0.21 kg/km) and zero emission
    return parseFloat((dist * 0.21).toFixed(4));
  }

  /**
   * Calculate home energy carbon footprint in kg CO2
   */
  static calculateEnergyEmission({
    electricity_units = 0,
    ac_hours = 0,
    fan_hours = 0,
    solar_energy = 0,
    renewable_percentage = 0
  }) {
    const units = parseFloat(electricity_units) || 0;
    const acHrs = parseFloat(ac_hours) || 0;
    const fanHrs = parseFloat(fan_hours) || 0;
    const solarKwh = parseFloat(solar_energy) || 0;
    const renewablePct = Math.min(100, Math.max(0, parseFloat(renewable_percentage) || 0));

    // Approximate appliance energy if electricity_units is not provided directly
    const estimatedAcKwh = acHrs * EMISSION_FACTORS.energy.ac_kw_estimate;
    const estimatedFanKwh = fanHrs * EMISSION_FACTORS.energy.fan_kw_estimate;
    const effectiveUnits = units > 0 ? units : (estimatedAcKwh + estimatedFanKwh);

    // Subtract solar generation if generated on site
    const netGridUnits = Math.max(0, effectiveUnits - solarKwh);

    // Apply renewable energy mix reduction
    const renewableFactor = (100 - renewablePct) / 100;
    const emission = netGridUnits * EMISSION_FACTORS.energy.grid_electricity_per_kwh * renewableFactor;

    return parseFloat(emission.toFixed(4));
  }

  /**
   * Calculate food carbon footprint in kg CO2
   */
  static calculateFoodEmission({
    food_type = 'vegetarian',
    meals_per_day = 3,
    is_organic = false,
    is_local = false
  }) {
    const typeKey = (food_type || 'vegetarian').toLowerCase().replace(' ', '_');
    const baseDaily = EMISSION_FACTORS.food[typeKey] || EMISSION_FACTORS.food.vegetarian;
    const mealCount = parseInt(meals_per_day, 10) || 3;

    // Daily base is for 3 standard meals
    let dailyEmission = (baseDaily / 3) * mealCount;

    if (is_organic) {
      dailyEmission *= (1 - EMISSION_FACTORS.food.organic_discount);
    }
    if (is_local) {
      dailyEmission *= (1 - EMISSION_FACTORS.food.local_discount);
    }

    return parseFloat(dailyEmission.toFixed(4));
  }

  /**
   * Calculate waste emission, offsets, and reduction score
   */
  static calculateWasteMetrics({
    plastic_waste = 0,
    recycled_waste = 0,
    composting = 0,
    paper_waste = 0,
    electronic_waste = 0
  }) {
    const plastic = parseFloat(plastic_waste) || 0;
    const recycled = parseFloat(recycled_waste) || 0;
    const compost = parseFloat(composting) || 0;
    const paper = parseFloat(paper_waste) || 0;
    const ewaste = parseFloat(electronic_waste) || 0;

    const totalWasteKg = plastic + recycled + compost + paper + ewaste;
    const divertedWasteKg = recycled + compost;

    // Waste reduction score (0 to 100%)
    let reductionScore = 0;
    if (totalWasteKg > 0) {
      reductionScore = (divertedWasteKg / totalWasteKg) * 100;
    } else {
      reductionScore = 100; // Zero waste produced
    }
    reductionScore = Math.min(100, Math.max(0, parseFloat(reductionScore.toFixed(2))));

    // Net carbon offset (avoided CO2 from recycling and composting)
    const recycledOffset = recycled * EMISSION_FACTORS.waste.recycled_offset;
    const compostOffset = compost * EMISSION_FACTORS.waste.composting_offset;
    const netOffset = parseFloat((recycledOffset + compostOffset).toFixed(4));

    // Gross emissions from non-recycled landfill plastic & e-waste
    const grossEmissions = parseFloat((
      (plastic * EMISSION_FACTORS.waste.plastic) +
      (paper * 0.5) +
      (ewaste * EMISSION_FACTORS.waste.electronic)
    ).toFixed(4));

    return {
      waste_reduction_score: reductionScore,
      carbon_offset: netOffset,
      gross_emissions: grossEmissions
    };
  }

  /**
   * Aggregate total carbon footprint and calculate composite Sustainability Score (0-100)
   */
  static calculateAggregates({ activities = [], energyLogs = [], foodLogs = [], wasteLogs = [] }) {
    const activityTotal = activities.reduce((sum, item) => sum + (parseFloat(item.carbon_emission) || 0), 0);
    const energyTotal = energyLogs.reduce((sum, item) => sum + (parseFloat(item.carbon_emission) || 0), 0);
    const foodTotal = foodLogs.reduce((sum, item) => sum + (parseFloat(item.carbon_emission) || 0), 0);
    const wasteGross = wasteLogs.reduce((sum, item) => {
      const p = (parseFloat(item.plastic_waste) || 0) * 2.5;
      const e = (parseFloat(item.electronic_waste) || 0) * 15.0;
      return sum + p + e;
    }, 0);
    const wasteOffsets = wasteLogs.reduce((sum, item) => sum + (parseFloat(item.carbon_offset) || 0), 0);

    const grossTotal = activityTotal + energyTotal + foodTotal + wasteGross;
    const netTotal = Math.max(0, grossTotal - wasteOffsets);

    // Calculate Sustainability Score (0 to 100)
    // Benchmark average urban Indian footprint is ~150-200 kg CO2/month (5-6.5 kg CO2/day)
    const benchmarkDailyKg = 6.0;
    const daysTracked = Math.max(1, new Set([
      ...activities.map(a => a.date),
      ...energyLogs.map(e => e.date),
      ...foodLogs.map(f => f.date),
      ...wasteLogs.map(w => w.date),
    ]).size);

    const averageDailyEmission = netTotal / daysTracked;
    // Score scaling: 0 kg/day = 100, 6 kg/day = 60, >12 kg/day = 20
    let emissionScore = 100 - (averageDailyEmission / (benchmarkDailyKg * 2)) * 80;
    emissionScore = Math.min(95, Math.max(15, emissionScore));

    // Bonus points for recycling and clean commute
    const totalWalkBikeKm = activities
      .filter(a => ['walking', 'bike'].includes(a.activity_type))
      .reduce((sum, a) => sum + (parseFloat(a.distance) || 0), 0);
    const commuteBonus = Math.min(10, totalWalkBikeKm * 0.2);

    const avgWasteScore = wasteLogs.length > 0
      ? wasteLogs.reduce((sum, w) => sum + (parseFloat(w.waste_reduction_score) || 0), 0) / wasteLogs.length
      : 50;
    const wasteBonus = (avgWasteScore / 100) * 10;

    const sustainabilityScore = Math.round(Math.min(100, Math.max(10, emissionScore + commuteBonus + (wasteBonus - 5))));

    return {
      totalCarbonKg: parseFloat(netTotal.toFixed(2)),
      grossCarbonKg: parseFloat(grossTotal.toFixed(2)),
      wasteOffsetKg: parseFloat(wasteOffsets.toFixed(2)),
      sustainabilityScore,
      breakdown: {
        transport: parseFloat(activityTotal.toFixed(2)),
        energy: parseFloat(energyTotal.toFixed(2)),
        food: parseFloat(foodTotal.toFixed(2)),
        waste: parseFloat(Math.max(0, wasteGross - wasteOffsets).toFixed(2))
      }
    };
  }
}

module.exports = CarbonCalculator;
