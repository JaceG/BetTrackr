import "dotenv/config";
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
  type UpdateUserSettings,
  type Bankroll,
  type InsertBankroll,
  type UpdateBankroll
} from "@shared/schema";
import { type IStorage } from "./storage";

export class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
    // Only create MongoClient if we have a valid URI
    if (uri && uri.trim().length > 0) {
      this.client = new MongoClient(uri);
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    if (!this.client) {
      throw new Error("MongoDB URI not configured. Set MONGODB_URI environment variable.");
    }
    
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

  getConnectionStatus(): boolean {
    return this.isConnected && this.db !== null;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = this.ensureConnected();
    const user = await db.collection("users").findOne({ email });
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

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const db = this.ensureConnected();
    if (!ObjectId.isValid(id)) {
      return undefined;
    }
    
    const objectId = new ObjectId(id);
    const updateResult = await db.collection("users").updateOne(
      { _id: objectId } as any,
      { $set: { stripeCustomerId, stripeSubscriptionId } }
    );
    
    if (updateResult.matchedCount === 0) {
      return undefined;
    }
    
    const updatedDoc = await db.collection("users").findOne({ _id: objectId } as any);
    if (!updatedDoc) {
      return undefined;
    }
    
    (updatedDoc as any)._id = updatedDoc._id.toString();
    return updatedDoc as unknown as User;
  }

  async setPremiumOverride(id: string, premiumOverride: boolean): Promise<User | undefined> {
    const db = this.ensureConnected();
    if (!ObjectId.isValid(id)) {
      return undefined;
    }
    
    const objectId = new ObjectId(id);
    const updateResult = await db.collection("users").updateOne(
      { _id: objectId } as any,
      { $set: { premiumOverride } }
    );
    
    if (updateResult.matchedCount === 0) {
      return undefined;
    }
    
    const updatedDoc = await db.collection("users").findOne({ _id: objectId } as any);
    if (!updatedDoc) {
      return undefined;
    }
    
    (updatedDoc as any)._id = updatedDoc._id.toString();
    return updatedDoc as unknown as User;
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

async updateBettingEntry(userId: string, id: string, data: Partial<InsertBettingEntry>): Promise<BettingEntry | null> {
    const db = this.ensureConnected();
    const doc = await db.collection("betting_entries").findOneAndUpdate(
      { _id: id, userId } as any,
      { $set: data },
      { returnDocument: "after" }
    );

    // MongoDB driver 5.x+ returns document directly (not { value: document })
    if (!doc) return null;

    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      date: doc.date,
      net: doc.net,
      betAmount: doc.betAmount,
      winningAmount: doc.winningAmount,
      notes: doc.notes || "",
    };
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

  // Bankroll methods for multiple bankrolls feature
  async getBankrolls(userId: string): Promise<Bankroll[]> {
    const db = this.ensureConnected();
    const bankrolls = await db.collection("bankrolls").find({ userId }).toArray();
    return bankrolls.map(bankroll => ({
      ...bankroll,
      _id: bankroll._id.toString(),
      createdAt: bankroll.createdAt || new Date(),
    })) as unknown as Bankroll[];
  }

  async getBankroll(userId: string, id: string): Promise<Bankroll | undefined> {
    const db = this.ensureConnected();
    const bankroll = await db.collection("bankrolls").findOne({ _id: id, userId } as any);
    if (!bankroll) return undefined;
    return {
      ...bankroll,
      _id: bankroll._id.toString(),
      createdAt: bankroll.createdAt || new Date(),
    } as unknown as Bankroll;
  }

  async createBankroll(userId: string, bankroll: InsertBankroll): Promise<Bankroll> {
    const db = this.ensureConnected();
    const _id = new ObjectId().toString();
    
    // If this bankroll is set as default, unset other defaults
    if (bankroll.isDefault) {
      await db.collection("bankrolls").updateMany(
        { userId } as any,
        { $set: { isDefault: false } }
      );
    }
    
    const bankrollDoc: Bankroll = {
      _id,
      userId,
      ...bankroll,
      createdAt: new Date(),
    };
    await db.collection("bankrolls").insertOne(bankrollDoc as any);
    return bankrollDoc;
  }

  async updateBankroll(userId: string, id: string, updates: UpdateBankroll): Promise<Bankroll | undefined> {
    const db = this.ensureConnected();
    
    // If setting as default, unset other defaults first
    if (updates.isDefault) {
      await db.collection("bankrolls").updateMany(
        { userId, _id: { $ne: id } } as any,
        { $set: { isDefault: false } }
      );
    }
    
    const doc = await db.collection("bankrolls").findOneAndUpdate(
      { _id: id, userId } as any,
      { $set: updates },
      { returnDocument: "after" }
    );
    
    // MongoDB driver 5.x+ returns document directly (not { value: document })
    if (!doc) return undefined;
    
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      color: doc.color,
      description: doc.description,
      baseline: doc.baseline,
      isDefault: doc.isDefault,
      createdAt: doc.createdAt || new Date(),
    };
  }

  async deleteBankroll(userId: string, id: string): Promise<boolean> {
    const db = this.ensureConnected();
    
    // First, reassign all betting entries from this bankroll to no bankroll
    await db.collection("betting_entries").updateMany(
      { userId, bankrollId: id } as any,
      { $unset: { bankrollId: "" } }
    );
    
    const result = await db.collection("bankrolls").deleteOne({ _id: id, userId } as any);
    return result.deletedCount === 1;
  }

  async getDefaultBankroll(userId: string): Promise<Bankroll | undefined> {
    const db = this.ensureConnected();
    const bankroll = await db.collection("bankrolls").findOne({ userId, isDefault: true } as any);
    if (!bankroll) return undefined;
    return {
      ...bankroll,
      _id: bankroll._id.toString(),
      createdAt: bankroll.createdAt || new Date(),
    } as unknown as Bankroll;
  }

  async close(): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("MongoDB connection closed");
    }
  }
}

// Initialize MongoDB storage (optional - will fail gracefully if not configured)
const mongoUri = process.env.MONGODB_URI || "";

export const mongoStorage = new MongoStorage(mongoUri);
