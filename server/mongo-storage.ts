import { MongoClient, Db, ObjectId } from "mongodb";
import { type User, type InsertUser, type UpdateUser, type TipExpense, type InsertTipExpense } from "@shared/schema";
import { type IStorage } from "./storage";

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
      this.db = this.client.db("sportsBetApp");
      this.isConnected = true;
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  private ensureConnected(): Db {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = this.ensureConnected();
    if (!ObjectId.isValid(id)) {
      return undefined;
    }
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) } as any);
    if (user && user._id) {
      user._id = user._id.toString();
    }
    return user ? (user as unknown as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = this.ensureConnected();
    const user = await db.collection("users").findOne({ username });
    if (user && user._id && typeof user._id !== 'string') {
      user._id = user._id.toString();
    }
    return user ? (user as unknown as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = this.ensureConnected();
    // Generate an ObjectId for MongoDB
    const objectId = new ObjectId();
    const userDoc = {
      ...insertUser,
      _id: objectId,
      createdAt: new Date(),
    };
    
    await db.collection("users").insertOne(userDoc as any);
    
    // Return user with string _id
    const user: User = {
      ...insertUser,
      _id: objectId.toString(),
      createdAt: userDoc.createdAt,
    };
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User | undefined> {
    const db = this.ensureConnected();
    if (!ObjectId.isValid(id)) {
      return undefined;
    }
    
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      { $set: updates },
      { returnDocument: "after" }
    );
    
    if (result?.value && result.value._id) {
      result.value._id = result.value._id.toString();
    }
    return result?.value ? (result.value as unknown as User) : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = this.ensureConnected();
    if (!ObjectId.isValid(id)) {
      return false;
    }
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount === 1;
  }

  async getTipExpenses(): Promise<TipExpense[]> {
    const db = this.ensureConnected();
    const expenses = await db.collection("tip_expenses").find().toArray();
    return expenses as unknown as TipExpense[];
  }

  async createTipExpense(expense: InsertTipExpense): Promise<TipExpense> {
    const db = this.ensureConnected();
    const _id = new ObjectId().toString();
    const tipExpense: TipExpense = {
      _id,
      date: expense.date,
      amount: expense.amount,
      provider: expense.provider ?? null,
      notes: expense.notes ?? null,
    };
    await db.collection("tip_expenses").insertOne(tipExpense as any);
    return tipExpense;
  }

  async deleteTipExpense(id: string): Promise<boolean> {
    const db = this.ensureConnected();
    const result = await db.collection("tip_expenses").deleteOne({ _id: id } as any);
    return result.deletedCount === 1;
  }

  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log("MongoDB connection closed");
    }
  }
}

// Initialize MongoDB storage
const mongoUri = process.env.DEMO_MONGODB_URI;
if (!mongoUri) {
  throw new Error("DEMO_MONGODB_URI environment variable is not set");
}

export const mongoStorage = new MongoStorage(mongoUri);
