import { type User, type InsertUser, type UpdateUser, type TipExpense, type InsertTipExpense } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Tip expense methods
  getTipExpenses(): Promise<TipExpense[]>;
  createTipExpense(expense: InsertTipExpense): Promise<TipExpense>;
  deleteTipExpense(id: string): Promise<boolean>;
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

  async getTipExpenses(): Promise<TipExpense[]> {
    return Array.from(this.tipExpenses.values());
  }

  async createTipExpense(expense: InsertTipExpense): Promise<TipExpense> {
    const _id = randomUUID();
    const tipExpense: TipExpense = { 
      _id,
      date: expense.date,
      amount: expense.amount,
      provider: expense.provider ?? null,
      notes: expense.notes ?? null,
    };
    this.tipExpenses.set(_id, tipExpense);
    return tipExpense;
  }

  async deleteTipExpense(id: string): Promise<boolean> {
    return this.tipExpenses.delete(id);
  }
}

export const storage = new MemStorage();
