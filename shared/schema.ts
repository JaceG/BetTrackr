import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const tipExpenses = pgTable("tip_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  amount: text("amount").notNull(),
  provider: text("provider"),
  notes: text("notes"),
});

export const insertTipExpenseSchema = createInsertSchema(tipExpenses).omit({
  id: true,
});

export type InsertTipExpense = z.infer<typeof insertTipExpenseSchema>;
export type TipExpense = typeof tipExpenses.$inferSelect;
