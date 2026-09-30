const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { supabase, isMock } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class AuthController {
  /**
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return errorResponse(res, 'An account with this email address already exists', 409);
      }

      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = uuidv4();
      const newUser = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        carbon_target_monthly: 320.0,
        monthly_budget: 25000.0,
        created_at: new Date().toISOString()
      };

      await supabase.from('users').insert(newUser);

      // Initialize gamification profile
      await supabase.from('gamification').insert({
        id: uuidv4(),
        user_id: userId,
        points: 50, // Welcome points
        level: 1,
        level_name: 'Beginner',
        daily_streak: 1,
        weekly_streak: 1,
        goal_streak: 0,
        last_log_date: new Date().toISOString().split('T')[0],
        badges: [],
        achievements: [],
        updated_at: new Date().toISOString()
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: userId, email: newUser.email, role: newUser.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
      );

      const userResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        carbon_target_monthly: newUser.carbon_target_monthly,
        monthly_budget: newUser.monthly_budget
      };

      return successResponse(res, { user: userResponse, token }, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Login user
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return errorResponse(res, 'Invalid email or password credentials', 401);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Invalid email or password credentials', 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
      );

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        carbon_target_monthly: user.carbon_target_monthly,
        monthly_budget: user.monthly_budget
      };

      return successResponse(res, { user: userResponse, token }, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get authenticated user profile
   */
  static async getProfile(req, res, next) {
    try {
      const { data: gamification } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', req.user.id)
        .single();

      return successResponse(res, {
        user: req.user,
        gamification: gamification || null
      }, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, avatar, carbon_target_monthly, monthly_budget } = req.body;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (avatar !== undefined) updates.avatar = avatar;
      if (carbon_target_monthly !== undefined) updates.carbon_target_monthly = parseFloat(carbon_target_monthly);
      if (monthly_budget !== undefined) updates.monthly_budget = parseFloat(monthly_budget);

      const { data: updated, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', req.user.id);

      return successResponse(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset / Change Password
   */
  static async resetPassword(req, res, next) {
    try {
      const { email, newPassword } = req.body;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!user) {
        return errorResponse(res, 'User with this email not found', 404);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);

      return successResponse(res, null, 'Password has been updated successfully. Please log in.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
