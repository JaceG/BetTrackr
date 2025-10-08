import { z } from "zod";

// User schemas for MongoDB
export const userSchema = z.object({
  _id: z.string(),
  username: z.string(),
  password: z.string(),
  email: z.string().email().optional(),
  createdAt: z.date(),
});

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Tip expense schemas for MongoDB
export const tipExpenseSchema = z.object({
  _id: z.string(),
  date: z.string(),
  amount: z.string(),
  provider: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const insertTipExpenseSchema = z.object({
  date: z.string(),
  amount: z.string(),
  provider: z.string().optional(),
  notes: z.string().optional(),
});

export type TipExpense = z.infer<typeof tipExpenseSchema>;
export type InsertTipExpense = z.infer<typeof insertTipExpenseSchema>;
