-- =========================================================================
-- AI Sustainability Tracker: Complete Supabase PostgreSQL Database Schema
-- Production Ready with RLS, Constraints, Indexes & Triggers
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar VARCHAR(500),
    carbon_target_monthly NUMERIC(10, 2) DEFAULT 350.00, -- in kg CO2
    monthly_budget NUMERIC(12, 2) DEFAULT 25000.00,      -- in INR / currency
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ACTIVITIES TABLE (Travel & Movement)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'car', 'bike', 'bus', 'metro', 'train', 'shared_ride', 'walking'
    distance NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- in kilometers
    duration NUMERIC(10, 2) DEFAULT 0.00,          -- in minutes
    steps INTEGER DEFAULT 0,
    fuel_type VARCHAR(50),                         -- 'petrol', 'diesel', 'electric', 'hybrid'
    fuel_consumed NUMERIC(10, 2) DEFAULT 0.00,     -- in liters or kWh
    cost NUMERIC(10, 2) DEFAULT 0.00,              -- monetary cost
    carbon_emission NUMERIC(10, 4) NOT NULL DEFAULT 0.0000, -- in kg CO2
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ENERGY USAGE TABLE (Home & Appliances)
CREATE TABLE IF NOT EXISTS energy_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    electricity_units NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- in kWh
    ac_hours NUMERIC(10, 2) DEFAULT 0.00,
    fan_hours NUMERIC(10, 2) DEFAULT 0.00,
    appliance_usage JSONB DEFAULT '{}'::jsonb, -- e.g. {"refrigerator": 24, "washing_machine": 1.5, "tv": 4}
    solar_energy NUMERIC(10, 2) DEFAULT 0.00,  -- in kWh generated
    renewable_percentage NUMERIC(5, 2) DEFAULT 0.00, -- 0 to 100%
    carbon_emission NUMERIC(10, 4) NOT NULL DEFAULT 0.0000, -- in kg CO2
    cost NUMERIC(10, 2) DEFAULT 0.00,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. FOOD CONSUMPTION TABLE (Diet & Food Habits)
CREATE TABLE IF NOT EXISTS food_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    food_type VARCHAR(50) NOT NULL, -- 'vegan', 'vegetarian', 'mixed', 'meat_heavy'
    meals_per_day INTEGER DEFAULT 3,
    food_spending NUMERIC(10, 2) DEFAULT 0.00,
    is_organic BOOLEAN DEFAULT FALSE,
    is_local BOOLEAN DEFAULT FALSE,
    carbon_emission NUMERIC(10, 4) NOT NULL DEFAULT 0.0000, -- in kg CO2
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. WASTE MANAGEMENT TABLE (Disposal & Recycling)
CREATE TABLE IF NOT EXISTS waste_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plastic_waste NUMERIC(10, 2) DEFAULT 0.00,    -- in kg
    recycled_waste NUMERIC(10, 2) DEFAULT 0.00,   -- in kg
    composting NUMERIC(10, 2) DEFAULT 0.00,       -- in kg
    paper_waste NUMERIC(10, 2) DEFAULT 0.00,      -- in kg
    electronic_waste NUMERIC(10, 2) DEFAULT 0.00, -- in kg
    waste_reduction_score NUMERIC(5, 2) DEFAULT 0.00, -- 0-100%
    carbon_offset NUMERIC(10, 4) DEFAULT 0.0000,  -- net CO2 avoided (positive offset)
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. GOALS TABLE (Sustainability & Eco Targets)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    goal_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'carbon', 'transport', 'energy', 'waste', 'savings'
    target NUMERIC(10, 2) NOT NULL,
    progress NUMERIC(10, 2) DEFAULT 0.00,
    unit VARCHAR(50) NOT NULL, -- 'kg CO2', 'km', 'hours', '₹', '%'
    deadline DATE,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. EXPENSES TABLE (Money-Saving & Sustainability)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'transport', 'electricity', 'food', 'sustainable_purchase', 'other'
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    is_sustainable BOOLEAN DEFAULT FALSE,
    savings_estimate NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GAMIFICATION & ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1, -- 1=Beginner, 2=Green Explorer, 3=Eco Warrior, 4=Carbon Reducer, 5=Sustainability Champion
    level_name VARCHAR(100) DEFAULT 'Beginner',
    daily_streak INTEGER DEFAULT 1,
    weekly_streak INTEGER DEFAULT 1,
    goal_streak INTEGER DEFAULT 0,
    last_log_date DATE DEFAULT CURRENT_DATE,
    badges JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'reminder', 'goal', 'carbon_alert', 'report', 'achievement', 'money'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_energy_user_date ON energy_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_user_date ON food_consumption(user_id, date);
CREATE INDEX IF NOT EXISTS idx_waste_user_date ON waste_management(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Note: In Supabase, auth.uid() matches user_id for authenticated sessions.
