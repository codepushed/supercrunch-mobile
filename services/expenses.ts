/**
 * Expenses Service
 * Handles expense tracking API calls to Supabase
 */

import { supabase } from '@/lib/supabase';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  notes?: string;
  created_at: string;
}

export type ExpenseCategory = 'Shopping' | 'Transport' | 'Food' | 'Utilities' | 'Ingredients' | 'Packaging' | 'Salary' | 'Other';

export const EXPENSE_CATEGORIES: { name: ExpenseCategory; color: string }[] = [
  { name: 'Ingredients', color: '#9C7CF4' },
  { name: 'Packaging', color: '#F4A7B9' },
  { name: 'Transport', color: '#7CB9E8' },
  { name: 'Utilities', color: '#77DD77' },
  { name: 'Salary', color: '#FFB347' },
  { name: 'Shopping', color: '#DDA0DD' },
  { name: 'Food', color: '#F49AC2' },
  { name: 'Other', color: '#CFCFC4' },
];

export const getCategoryColor = (category: string): string => {
  const found = EXPENSE_CATEGORIES.find((c) => c.name === category);
  return found?.color || '#CFCFC4';
};

/**
 * Fetch all expenses
 */
export const fetchExpenses = async (
  startDate?: Date,
  endDate?: Date
): Promise<{ data: Expense[] | null; error: any }> => {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      return { data: null, error };
    }

    return { data: data as Expense[], error: null };
  } catch (error) {
    console.error('Exception fetching expenses:', error);
    return { data: null, error };
  }
};

/**
 * Fetch expenses for today
 */
export const fetchDailyExpenses = async (): Promise<{
  data: Expense[] | null;
  error: any;
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return fetchExpenses(today, tomorrow);
};

/**
 * Fetch expenses for this week
 */
export const fetchWeeklyExpenses = async (): Promise<{
  data: Expense[] | null;
  error: any;
}> => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return fetchExpenses(startOfWeek, endOfWeek);
};

/**
 * Fetch expenses for this month
 */
export const fetchMonthlyExpenses = async (): Promise<{
  data: Expense[] | null;
  error: any;
}> => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  return fetchExpenses(startOfMonth, endOfMonth);
};

/**
 * Add a new expense
 */
export const addExpense = async (
  expense: Omit<Expense, 'id' | 'created_at'>
): Promise<{ data: Expense | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      return { data: null, error };
    }

    return { data: data as Expense, error: null };
  } catch (error) {
    console.error('Exception adding expense:', error);
    return { data: null, error };
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (
  id: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Exception deleting expense:', error);
    return { error };
  }
};

/**
 * Calculate category totals and percentages
 */
export const calculateCategoryStats = (
  expenses: Expense[]
): { category: string; total: number; percentage: number; color: string }[] => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? Math.round((total / totalAmount) * 100) : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.total - a.total);
};
