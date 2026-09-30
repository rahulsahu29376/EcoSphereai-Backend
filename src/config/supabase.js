const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

let realSupabase = null;
let isMock = false;

// Check if valid Supabase configuration is present
const hasSupabaseConfig = Boolean(
  env.supabaseUrl &&
  env.supabaseKey &&
  !env.supabaseUrl.includes('your-project') &&
  !env.supabaseKey.includes('your-supabase')
);

if (hasSupabaseConfig) {
  try {
    realSupabase = createClient(env.supabaseUrl, env.supabaseKey);
    console.log('✅ Supabase Client initialized with project:', env.supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client. Falling back to local store.', err.message);
    isMock = true;
  }
} else {
  console.log('ℹ️ Running with built-in resilient in-memory datastore (Supabase credentials not configured).');
  isMock = true;
}

// -------------------------------------------------------------
// In-Memory Database Fallback for Instant Zero-Setup Execution
// -------------------------------------------------------------
const localStore = {
  users: [
    {
      id: 'demo-user-1234-5678-90ab-cdef12345678',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      carbon_target_monthly: 320.0,
      monthly_budget: 25000,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  activities: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      activity_type: 'metro',
      distance: 14.5,
      duration: 35,
      steps: 1200,
      fuel_type: 'electric',
      fuel_consumed: 0,
      cost: 40,
      carbon_emission: 0.725,
      date: new Date().toISOString().split('T')[0],
      notes: 'Commute to tech park via Rapid Metro',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      activity_type: 'walking',
      distance: 3.8,
      duration: 45,
      steps: 5400,
      fuel_type: 'none',
      fuel_consumed: 0,
      cost: 0,
      carbon_emission: 0.0,
      date: new Date().toISOString().split('T')[0],
      notes: 'Evening stroll in neighborhood park',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      activity_type: 'car',
      distance: 22.0,
      duration: 40,
      steps: 0,
      fuel_type: 'petrol',
      fuel_consumed: 1.6,
      cost: 165,
      carbon_emission: 4.62,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      notes: 'Client meeting across town',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      activity_type: 'bus',
      distance: 18.0,
      duration: 50,
      steps: 800,
      fuel_type: 'cng',
      fuel_consumed: 0,
      cost: 25,
      carbon_emission: 1.8,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      notes: 'Electric city bus commute',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      activity_type: 'bike',
      distance: 8.2,
      duration: 25,
      steps: 0,
      fuel_type: 'none',
      fuel_consumed: 0,
      cost: 0,
      carbon_emission: 0.0,
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      notes: 'Morning bicycle workout',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  energy_usage: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      electricity_units: 8.5,
      ac_hours: 3.5,
      fan_hours: 8.0,
      appliance_usage: { refrigerator: 24, laptop: 6, led_lights: 5 },
      solar_energy: 3.2,
      renewable_percentage: 35.0,
      carbon_emission: 3.98,
      cost: 68.0,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      electricity_units: 11.2,
      ac_hours: 5.0,
      fan_hours: 10.0,
      appliance_usage: { refrigerator: 24, washing_machine: 1, tv: 3 },
      solar_energy: 2.8,
      renewable_percentage: 25.0,
      carbon_emission: 6.05,
      cost: 89.5,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      electricity_units: 9.0,
      ac_hours: 4.0,
      fan_hours: 8.0,
      appliance_usage: { refrigerator: 24, microwave: 0.5 },
      solar_energy: 4.1,
      renewable_percentage: 45.0,
      carbon_emission: 3.56,
      cost: 72.0,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  food_consumption: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      food_type: 'vegetarian',
      meals_per_day: 3,
      food_spending: 320.0,
      is_organic: true,
      is_local: true,
      carbon_emission: 1.15,
      date: new Date().toISOString().split('T')[0],
      notes: 'Farm fresh organic vegetables and lentils',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      food_type: 'vegan',
      meals_per_day: 3,
      food_spending: 280.0,
      is_organic: true,
      is_local: true,
      carbon_emission: 0.85,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      notes: 'Plant based tofu salad and grains',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      food_type: 'mixed',
      meals_per_day: 3,
      food_spending: 450.0,
      is_organic: false,
      is_local: true,
      carbon_emission: 2.80,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      notes: 'Dining out with colleagues',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  waste_management: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      plastic_waste: 0.2,
      recycled_waste: 1.5,
      composting: 1.2,
      paper_waste: 0.4,
      electronic_waste: 0.0,
      waste_reduction_score: 82.5,
      carbon_offset: 2.76,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      plastic_waste: 0.4,
      recycled_waste: 1.0,
      composting: 0.8,
      paper_waste: 0.6,
      electronic_waste: 0.0,
      waste_reduction_score: 64.0,
      carbon_offset: 1.84,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  goals: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      goal_name: 'Reduce carbon footprint by 20%',
      category: 'carbon',
      target: 280.0,
      progress: 295.4,
      unit: 'kg CO2',
      deadline: '2026-10-31',
      status: 'in_progress',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      goal_name: 'Walk 50 km this month',
      category: 'transport',
      target: 50.0,
      progress: 32.5,
      unit: 'km',
      deadline: '2026-10-25',
      status: 'in_progress',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      goal_name: 'Use public transport 20 times',
      category: 'transport',
      target: 20.0,
      progress: 14.0,
      unit: 'trips',
      deadline: '2026-10-31',
      status: 'in_progress',
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      goal_name: 'Save ₹5000 via Green Habits',
      category: 'savings',
      target: 5000.0,
      progress: 3450.0,
      unit: '₹',
      deadline: '2026-11-15',
      status: 'in_progress',
      created_at: new Date().toISOString()
    }
  ],
  expenses: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      category: 'transport',
      amount: 40.0,
      date: new Date().toISOString().split('T')[0],
      description: 'Metro smart card recharge (saved ~₹160 vs Uber)',
      is_sustainable: true,
      savings_estimate: 160.0,
      created_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      category: 'sustainable_purchase',
      amount: 850.0,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      description: 'Stainless steel reusable thermoflask & lunch container',
      is_sustainable: true,
      savings_estimate: 2400.0,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      category: 'electricity',
      amount: 2150.0,
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      description: 'Monthly electricity bill with solar net metering discount',
      is_sustainable: true,
      savings_estimate: 680.0,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      category: 'food',
      amount: 920.0,
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      description: 'Local farmers market organic produce',
      is_sustainable: true,
      savings_estimate: 220.0,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  gamification: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      points: 840,
      level: 4,
      level_name: 'Carbon Reducer',
      daily_streak: 6,
      weekly_streak: 3,
      goal_streak: 4,
      last_log_date: new Date().toISOString().split('T')[0],
      badges: [
        { id: 'b1', name: 'Eco Starter', icon: '🌱', description: 'First activity logged', unlocked_at: new Date(Date.now() - 25 * 86400000).toISOString() },
        { id: 'b2', name: 'Green Hero', icon: '🦸‍♂️', description: 'Reduced > 50 kg CO2 emissions', unlocked_at: new Date(Date.now() - 15 * 86400000).toISOString() },
        { id: 'b3', name: 'Recycling Master', icon: '♻️', description: 'Recycled over 25 kg waste', unlocked_at: new Date(Date.now() - 5 * 86400000).toISOString() },
        { id: 'b4', name: 'Money Saver', icon: '💰', description: 'Saved over ₹3000 sustainably', unlocked_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      ],
      achievements: [
        { id: 'a1', title: 'First Activity Logged', completed: true, date: '2026-09-05' },
        { id: 'a2', title: '100 km Walked', completed: false, current: 62.5, target: 100 },
        { id: 'a3', title: '30 Days Recycling', completed: true, date: '2026-09-28' },
        { id: 'a4', title: '10% Carbon Reduction', completed: true, date: '2026-09-20' },
        { id: 'a5', title: '₹5000 Saved', completed: false, current: 3450, target: 5000 }
      ],
      updated_at: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      title: '🌟 Level Up Alert!',
      message: 'Congratulations! You reached Level 4: Carbon Reducer with 840 eco-points.',
      type: 'achievement',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      title: '💡 Smart Money-Saving Tip',
      message: 'Switching your evening commute to metro could save ₹1,400 this month.',
      type: 'money',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: uuidv4(),
      user_id: 'demo-user-1234-5678-90ab-cdef12345678',
      title: '🎯 Goal Milestone Reached',
      message: 'You have completed 65% of your "Walk 50 km" monthly goal.',
      type: 'goal',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

// Fluent query builder emulator for fallback
class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.sortField = null;
    this.sortAscending = true;
    this.limitCount = null;
    this.isSingle = false;
  }

  select(fields = '*') {
    return this;
  }

  eq(field, value) {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.sortField = field;
    this.sortAscending = ascending;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  update(updates) {
    this.pendingUpdates = updates;
    this.isUpdate = true;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async _execute() {
    if (!localStore[this.table]) localStore[this.table] = [];

    if (this.isInsert) {
      return { data: this.insertedResult, error: null };
    }

    if (this.isUpdate) {
      const matches = [];
      localStore[this.table] = localStore[this.table].map((item) => {
        const isMatch = this.filters.every((f) => f(item));
        if (isMatch) {
          const updated = { ...item, ...this.pendingUpdates, updated_at: new Date().toISOString() };
          matches.push(updated);
          return updated;
        }
        return item;
      });
      return { data: this.isSingle ? matches[0] : matches, error: null };
    }

    if (this.isDelete) {
      const initialLen = localStore[this.table].length;
      localStore[this.table] = localStore[this.table].filter((item) => {
        return !this.filters.every((f) => f(item));
      });
      const deletedCount = initialLen - localStore[this.table].length;
      return { data: { deleted: deletedCount }, error: null };
    }

    let result = localStore[this.table].filter((item) => {
      for (const filter of this.filters) {
        if (!filter(item)) return false;
      }
      return true;
    });

    if (this.sortField) {
      result = [...result].sort((a, b) => {
        const valA = a[this.sortField];
        const valB = b[this.sortField];
        if (valA < valB) return this.sortAscending ? -1 : 1;
        if (valA > valB) return this.sortAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  then(onFulfilled, onRejected) {
    return this._execute().then(onFulfilled, onRejected);
  }

  insert(data) {
    if (!localStore[this.table]) localStore[this.table] = [];
    const items = Array.isArray(data) ? data : [data];
    const inserted = items.map((item) => ({
      id: item.id || uuidv4(),
      created_at: item.created_at || new Date().toISOString(),
      ...item
    }));
    localStore[this.table].push(...inserted);
    this.isInsert = true;
    this.insertedResult = Array.isArray(data) ? inserted : inserted[0];
    return this;
  }

}

const mockSupabase = {
  from: (table) => new MockQueryBuilder(table),
  auth: {
    getUser: async () => ({ data: { user: null }, error: null })
  },
  _localStore: localStore
};

function wrapBuilder(builder, table, mockBuilder) {
  return new Proxy(builder, {
    get(target, prop) {
      if (prop === 'then') {
        return function (onFulfilled, onRejected) {
          return target.then((res) => {
            if (res && res.error && res.error.code === 'PGRST205') {
              console.warn(`[Supabase Notice] Table '${table}' not found in remote schema cache yet. Using resilient local store. Run supabase_schema.sql in Supabase SQL editor to enable remote persistence.`);
              return mockBuilder._execute().then(onFulfilled, onRejected);
            }
            return onFulfilled ? onFulfilled(res) : res;
          }, (err) => {
            return mockBuilder._execute().then(onFulfilled, onRejected);
          });
        };
      }
      const val = target[prop];
      if (typeof val === 'function') {
        return function (...args) {
          const ret = val.apply(target, args);
          if (mockBuilder[prop]) {
            try { mockBuilder[prop](...args); } catch (_) {}
          }
          if (ret && typeof ret.then === 'function') {
            return wrapBuilder(ret, table, mockBuilder);
          }
          return ret;
        };
      }
      return val;
    }
  });
}

// Resilient wrapper: tries real Supabase, falls back to local store if tables not yet migrated
const proxySupabase = {
  from: (table) => {
    if (!realSupabase) {
      return mockSupabase.from(table);
    }
    const realBuilder = realSupabase.from(table);
    const mockBuilder = mockSupabase.from(table);
    return wrapBuilder(realBuilder, table, mockBuilder);
  },
  auth: realSupabase ? realSupabase.auth : mockSupabase.auth,
  _localStore: localStore
};

module.exports = {
  supabase: realSupabase ? proxySupabase : mockSupabase,
  realSupabase,
  isMock: !realSupabase,
  localStore
};


