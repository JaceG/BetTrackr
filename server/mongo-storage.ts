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
    console.log("MongoDB getUser looking for _id:", id);
    // Try with ObjectId if the string is a valid ObjectId hex
    let user;
    if (ObjectId.isValid(id)) {
      user = await db.collection("users").findOne({ _id: new ObjectId(id) } as any);
    }
    if (!user) {
      user = await db.collection("users").findOne({ _id: id } as any);
    }
    console.log("MongoDB getUser result:", user ? "found" : "not found", user?._id);
    if (user && user._id) {
      // Convert MongoDB ObjectId to string for consistency
      user._id = user._id.toString();
    }
    return user ? (user as unknown as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = this.ensureConnected();
    const user = await db.collection("users").findOne({ username });
    if (user && user._id) {
      // Convert MongoDB ObjectId to string for consistency
      user._id = user._id.toString();
    }
    return user ? (user as unknown as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = this.ensureConnected();
    const objectId = new ObjectId();
    const userDoc = {
      ...insertUser,
      _id: objectId,
      createdAt: new Date(),
    };
    // Insert with ObjectId (MongoDB will store it as ObjectId type)
    await db.collection("users").insertOne(userDoc as any);
    console.log("Created user with _id (ObjectId):", objectId.toString());
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
    console.log("MongoDB updateUser looking for _id:", id, "is valid ObjectId?", ObjectId.isValid(id));
    console.log("Using database:", db.databaseName, "collection: users");
    
    // First, let's check if the user exists at all
    const existingUser = await db.collection("users").findOne({ _id: new ObjectId(id) } as any);
    console.log("Existing user check:", existingUser ? "FOUND user" : "NOT FOUND", existingUser?._id);
    
    // Try with ObjectId if the string is a valid ObjectId hex
    let result;
    try {
      if (ObjectId.isValid(id)) {
        const objId = new ObjectId(id);
        console.log("Querying with ObjectId:", objId.toString());
        result = await db.collection("users").findOneAndUpdate(
          { _id: objId } as any,
          { $set: updates },
          { returnDocument: "after" }
        );
        console.log("ObjectId query result:", result ? "got result" : "no result", "value:", result?.value ? "has value" : "no value");
      }
      if (!result?.value) {
        console.log("Trying string query with _id:", id);
        result = await db.collection("users").findOneAndUpdate(
          { _id: id } as any,
          { $set: updates },
          { returnDocument: "after" }
        );
        console.log("String query result:", result ? "got result" : "no result", "value:", result?.value ? "has value" : "no value");
      }
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
    console.log("MongoDB updateUser final result:", result?.value ? "found" : "not found", result?.value?._id);
    if (result?.value && result.value._id) {
      // Convert MongoDB ObjectId to string for consistency
      result.value._id = result.value._id.toString();
    }
    return result?.value ? (result.value as unknown as User) : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = this.ensureConnected();
    // Try with ObjectId if the string is a valid ObjectId hex
    let result;
    if (ObjectId.isValid(id)) {
      result = await db.collection("users").deleteOne({ _id: new ObjectId(id) } as any);
    }
    if (!result || result.deletedCount === 0) {
      result = await db.collection("users").deleteOne({ _id: id } as any);
    }
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
