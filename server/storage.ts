import { type User, type InsertUser, type UpdateUser, type TipExpense, type InsertTipExpense } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined>;
  
  // Tip expense methods
  getTipExpenses(userId: string): Promise<TipExpense[]>;
  createTipExpense(userId: string, expense: InsertTipExpense): Promise<TipExpense>;
  updateTipExpense(userId: string, id: string, updates: Partial<InsertTipExpense>): Promise<TipExpense | null>;
  deleteTipExpense(userId: string, id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tipExpenses: Map<string, TipExpense>;

  constructor() {
    this.users = new Map();
    this.tipExpenses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const _id = randomUUID();
    const user: User = { 
      ...insertUser, 
      _id,
      createdAt: new Date()
    };
    this.users.set(_id, user);
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, stripeCustomerId, stripeSubscriptionId };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTipExpenses(userId: string): Promise<TipExpense[]> {
    return Array.from(this.tipExpenses.values()).filter(e => e.userId === userId);
  }

  async createTipExpense(userId: string, expense: InsertTipExpense): Promise<TipExpense> {
    const _id = randomUUID();
    const tipExpense: TipExpense = { 
      _id,
      userId,
      date: expense.date,
      amount: expense.amount,
      provider: expense.provider ?? null,
      notes: expense.notes ?? null,
    };
    this.tipExpenses.set(_id, tipExpense);
    return tipExpense;
  }

  async updateTipExpense(userId: string, id: string, updates: Partial<InsertTipExpense>): Promise<TipExpense | null> {
    const expense = this.tipExpenses.get(id);
    if (!expense || expense.userId !== userId) return null;
    
    const updated: TipExpense = { ...expense, ...updates };
    this.tipExpenses.set(id, updated);
    return updated;
  }

  async deleteTipExpense(userId: string, id: string): Promise<boolean> {
    const expense = this.tipExpenses.get(id);
    if (!expense || expense.userId !== userId) return false;
    return this.tipExpenses.delete(id);
  }
}

export const storage = new MemStorage();
