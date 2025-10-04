import { type User, type InsertUser, type TipExpense, type InsertTipExpense } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTipExpenses(): Promise<TipExpense[]> {
    return Array.from(this.tipExpenses.values());
  }

  async createTipExpense(expense: InsertTipExpense): Promise<TipExpense> {
    const id = randomUUID();
    const tipExpense: TipExpense = { 
      id,
      date: expense.date,
      amount: expense.amount,
      provider: expense.provider ?? null,
      notes: expense.notes ?? null,
    };
    this.tipExpenses.set(id, tipExpense);
    return tipExpense;
  }

  async deleteTipExpense(id: string): Promise<boolean> {
    return this.tipExpenses.delete(id);
  }
}

export const storage = new MemStorage();
