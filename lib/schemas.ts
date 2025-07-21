import { z } from 'zod';

export const setBudgetSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
});

export const addExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.string().min(1, 'Amount is required'),
  tag: z.string().min(1, 'Tag is required'),
  date: z.string().min(1, 'Date is required'),
});

export const updateExpenseSchema = addExpenseSchema.extend({
  id: z.number().positive('Invalid ID'),
});

export const deleteExpenseSchema = z.object({
  id: z.number().positive('Invalid ID'),
});

export const addIncomeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
});

export const updateIncomeSchema = addIncomeSchema.extend({
  id: z.number().positive('Invalid ID'),
});

export const deleteIncomeSchema = z.object({
  id: z.number().positive('Invalid ID'),
});

export const addSharedExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  total_amount: z.string().min(1, 'Total amount is required'),
  date: z.string().min(1, 'Date is required'),
  shared_with_user_id: z.string().min(1, 'Shared with user is required'),
  category: z.string().optional(),
});

export const updateSharedExpenseSchema = addSharedExpenseSchema.extend({
  id: z.string().min(1, 'Invalid ID'),
});

export const deleteSharedExpenseSchema = z.object({
  id: z.string().min(1, 'Invalid ID'),
});

export const addSharedIncomeSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  total_amount: z.string().min(1, 'Total amount is required'),
  date: z.string().min(1, 'Date is required'),
  shared_with_user_id: z.string().min(1, 'Shared with user is required'),
  category: z.string().optional(),
});

export const updateSharedIncomeSchema = addSharedIncomeSchema.extend({
  id: z.string().min(1, 'Invalid ID'),
});

export const deleteSharedIncomeSchema = z.object({
  id: z.string().min(1, 'Invalid ID'),
});
