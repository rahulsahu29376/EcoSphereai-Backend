const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class ExpenseController {
  /**
   * Log an expense with sustainability & savings tagging
   */
  static async logExpense(req, res, next) {
    try {
      const {
        category,
        amount,
        date,
        description,
        is_sustainable,
        savings_estimate
      } = req.body;

      const userId = req.user.id;

      const newExpense = {
        id: uuidv4(),
        user_id: userId,
        category,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split('T')[0],
        description: description || '',
        is_sustainable: Boolean(is_sustainable),
        savings_estimate: parseFloat(savings_estimate) || 0,
        created_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase.from('expenses').insert(newExpense);

      return successResponse(res, inserted || newExpense, 'Expense recorded successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all expenses for user
   */
  static async getExpenses(req, res, next) {
    try {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

      if (error) {
        return errorResponse(res, 'Failed to fetch expenses', 500, error);
      }

      return successResponse(res, expenses || [], 'Expenses retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get detailed financial & sustainability analytics
   */
  static async getSavingsAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      const safeExpenses = expenses || [];
      const totalSpent = safeExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const totalSaved = safeExpenses.reduce((sum, e) => sum + (parseFloat(e.savings_estimate) || 0), 0);

      const sustainablePurchases = safeExpenses.filter(e => e.is_sustainable);
      const sustainableSpent = sustainablePurchases.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

      const monthlyBudget = req.user.monthly_budget || 25000;
      const budgetUsedPct = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

      // Category Breakdown
      const catMap = {};
      safeExpenses.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + (parseFloat(e.amount) || 0);
      });

      return successResponse(res, {
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalSaved: parseFloat(totalSaved.toFixed(2)),
        sustainableSpent: parseFloat(sustainableSpent.toFixed(2)),
        monthlyBudget,
        budgetUsedPct,
        categoryBreakdown: catMap,
        transactionsCount: safeExpenses.length
      }, 'Financial analytics computed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete expense
   */
  static async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) {
        return errorResponse(res, 'Failed to delete expense', 500, error);
      }

      return successResponse(res, null, 'Expense deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ExpenseController;
