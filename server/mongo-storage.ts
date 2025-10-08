import { MongoClient, Db, ObjectId } from "mongodb";
import { 
  type User, 
  type InsertUser, 
  type UpdateUser, 
  type TipExpense, 
  type InsertTipExpense,
  type BettingEntry,
  type InsertBettingEntry,
  type CapitalInjection,
  type InsertCapitalInjection,
  type UserSettings,
  type InsertUserSettings,
  type UpdateUserSettings
} from "@shared/schema";
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
      (user as any)._id = user._id.toString();
    }
    return user ? (user as unknown as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = this.ensureConnected();
    const user = await db.collection("users").findOne({ username });
    if (user && user._id && typeof user._id !== 'string') {
      (user as any)._id = user._id.toString();
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
    
    const objectId = new ObjectId(id);
    
    // Update the user
    const updateResult = await db.collection("users").updateOne(
      { _id: objectId } as any,
      { $set: updates }
    );
    
    if (updateResult.matchedCount === 0) {
      return undefined;
    }
    
    // Get the updated document
    const updatedDoc = await db.collection("users").findOne({ _id: objectId } as any);
    
    if (!updatedDoc) {
      return undefined;
    }
    
    // Convert ObjectId to string
    (updatedDoc as any)._id = updatedDoc._id.toString();
    return updatedDoc as unknown as User;
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

  // Betting entries methods
  async getBettingEntries(userId: string): Promise<BettingEntry[]> {
    const db = this.ensureConnected();
    const entries = await db.collection("betting_entries").find({ userId }).toArray();
    return entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(),
    })) as unknown as BettingEntry[];
  }

  async createBettingEntry(userId: string, entry: InsertBettingEntry): Promise<BettingEntry> {
    const db = this.ensureConnected();
    const _id = new ObjectId().toString();
    const bettingEntry: BettingEntry = {
      _id,
      userId,
      ...entry,
    };
    await db.collection("betting_entries").insertOne(bettingEntry as any);
    return bettingEntry;
  }

  async deleteBettingEntry(userId: string, id: string): Promise<boolean> {
    const db = this.ensureConnected();
    const result = await db.collection("betting_entries").deleteOne({ _id: id, userId } as any);
    return result.deletedCount === 1;
  }

  async deleteAllBettingEntries(userId: string): Promise<boolean> {
    const db = this.ensureConnected();
    await db.collection("betting_entries").deleteMany({ userId } as any);
    return true;
  }

  // Capital injection methods
  async getCapitalInjections(userId: string): Promise<CapitalInjection[]> {
    const db = this.ensureConnected();
    const injections = await db.collection("capital_injections").find({ userId }).toArray();
    return injections.map(injection => ({
      ...injection,
      _id: injection._id.toString(),
    })) as unknown as CapitalInjection[];
  }

  async createCapitalInjection(userId: string, injection: InsertCapitalInjection): Promise<CapitalInjection> {
    const db = this.ensureConnected();
    const _id = new ObjectId().toString();
    const capitalInjection: CapitalInjection = {
      _id,
      userId,
      ...injection,
    };
    await db.collection("capital_injections").insertOne(capitalInjection as any);
    return capitalInjection;
  }

  async deleteCapitalInjection(userId: string, id: string): Promise<boolean> {
    const db = this.ensureConnected();
    const result = await db.collection("capital_injections").deleteOne({ _id: id, userId } as any);
    return result.deletedCount === 1;
  }

  async deleteAllCapitalInjections(userId: string): Promise<boolean> {
    const db = this.ensureConnected();
    await db.collection("capital_injections").deleteMany({ userId } as any);
    return true;
  }

  // User settings methods
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const db = this.ensureConnected();
    const settings = await db.collection("user_settings").findOne({ userId });
    if (settings && settings._id && typeof settings._id !== 'string') {
      (settings as any)._id = settings._id.toString();
    }
    return settings ? (settings as unknown as UserSettings) : undefined;
  }

  async createUserSettings(userId: string, settings: InsertUserSettings): Promise<UserSettings> {
    const db = this.ensureConnected();
    const _id = new ObjectId().toString();
    const userSettings: UserSettings = {
      _id,
      userId,
      ...settings,
    };
    await db.collection("user_settings").insertOne(userSettings as any);
    return userSettings;
  }

  async updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<UserSettings | undefined> {
    const db = this.ensureConnected();
    
    const updateResult = await db.collection("user_settings").updateOne(
      { userId } as any,
      { $set: updates }
    );
    
    if (updateResult.matchedCount === 0) {
      return undefined;
    }
    
    const updatedDoc = await db.collection("user_settings").findOne({ userId } as any);
    
    if (!updatedDoc) {
      return undefined;
    }
    
    if (updatedDoc._id && typeof updatedDoc._id !== 'string') {
      (updatedDoc as any)._id = updatedDoc._id.toString();
    }
    return updatedDoc as unknown as UserSettings;
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
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export const mongoStorage = new MongoStorage(mongoUri);
