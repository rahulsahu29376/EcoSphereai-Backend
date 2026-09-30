/**
 * Comprehensive Automated End-to-End API Test Suite
 * Tests all backend modules, authentication, carbon calculators, AI advisor, gamification & reports
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('🧪 Starting AI Sustainability Tracker End-to-End Test Suite...\n');
  let token = '';

  try {
    // 1. Health check
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ [1/12] Health Check passed:', healthRes.data.status);

    // 2. Authentication: Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'rahul@example.com',
      password: 'password123'
    });
    token = loginRes.data.data.token;
    console.log('✅ [2/12] Auth Login passed: User authenticated as', loginRes.data.data.user.name);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Dashboard Data & KPIs
    const dashRes = await axios.get(`${BASE_URL}/dashboard`, authHeaders);
    console.log('✅ [3/12] Dashboard KPIs passed: Score =', dashRes.data.data.kpis.sustainabilityScore, '/ 100, Carbon =', dashRes.data.data.kpis.totalCarbonFootprint, 'kg CO₂');

    // 4. Activity Logging (Metro & Walking)
    const actRes = await axios.post(`${BASE_URL}/activities`, {
      activity_type: 'metro',
      distance: 12.0,
      duration: 30,
      cost: 35,
      date: new Date().toISOString().split('T')[0],
      notes: 'Commute via Metro'
    }, authHeaders);
    console.log('✅ [4/12] Activity Logged passed: Emission =', actRes.data.data.activity.carbon_emission, 'kg CO₂');

    // 5. Energy Tracking
    const energyRes = await axios.post(`${BASE_URL}/energy`, {
      electricity_units: 7.5,
      ac_hours: 3.0,
      fan_hours: 6.0,
      solar_energy: 2.5,
      renewable_percentage: 30.0,
      cost: 65,
      date: new Date().toISOString().split('T')[0]
    }, authHeaders);
    console.log('✅ [5/12] Energy Logged passed: Net Emission =', energyRes.data.data.energyLog.carbon_emission, 'kg CO₂');

    // 6. Food Tracking
    const foodRes = await axios.post(`${BASE_URL}/food`, {
      food_type: 'vegetarian',
      meals_per_day: 3,
      food_spending: 280,
      is_organic: true,
      is_local: true,
      date: new Date().toISOString().split('T')[0]
    }, authHeaders);
    console.log('✅ [6/12] Food Logged passed: Emission =', foodRes.data.data.foodLog.carbon_emission, 'kg CO₂');

    // 7. Waste Management
    const wasteRes = await axios.post(`${BASE_URL}/waste`, {
      plastic_waste: 0.1,
      recycled_waste: 1.5,
      composting: 0.8,
      paper_waste: 0.2,
      electronic_waste: 0.0,
      date: new Date().toISOString().split('T')[0]
    }, authHeaders);
    console.log('✅ [7/12] Waste Logged passed: Diversion Score =', wasteRes.data.data.wasteLog.waste_reduction_score, '%');

    // 8. Expense & Money Saving
    const expRes = await axios.post(`${BASE_URL}/expenses`, {
      category: 'sustainable_purchase',
      amount: 450,
      date: new Date().toISOString().split('T')[0],
      description: 'Zero-waste bamboo cutlery & canvas kit',
      is_sustainable: true,
      savings_estimate: 800
    }, authHeaders);
    console.log('✅ [8/12] Expense Logged passed: Saved = ₹', expRes.data.data.savings_estimate);

    // 9. AI Sustainability Advisor
    const aiRes = await axios.get(`${BASE_URL}/ai/advice`, authHeaders);
    console.log('✅ [9/12] AI Advisor passed: Potential Monthly Savings = ₹', aiRes.data.data.summary.totalPotentialMonthlySavingsINR);

    // 10. AI Chat Assistant
    const chatRes = await axios.post(`${BASE_URL}/ai/chat`, {
      message: 'How can I save ₹1500 on my electricity bill using clean energy?'
    }, authHeaders);
    console.log('✅ [10/12] AI Chat Assistant passed: Response category =', chatRes.data.data.category);

    // 11. Gamification & Streaks
    const gameRes = await axios.get(`${BASE_URL}/gamification/status`, authHeaders);
    console.log('✅ [11/12] Gamification passed: Current Level =', gameRes.data.data.level_name, '(', gameRes.data.data.points, 'points )');

    // 12. Reports & CSV Export
    const reportRes = await axios.get(`${BASE_URL}/reports?period=monthly`, authHeaders);
    const csvRes = await axios.get(`${BASE_URL}/reports/export/csv?period=monthly`, authHeaders);
    console.log('✅ [12/12] Reports & CSV Export passed: Generated', reportRes.data.data.period, 'report, CSV Length =', csvRes.data.length, 'bytes');

    console.log('\n🎉 ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (err) {
    console.error('❌ Test suite error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTestSuite();
