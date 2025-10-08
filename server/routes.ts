import type { Express } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongo-storage";
import { insertTipExpenseSchema, insertUserSchema, updateUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await mongoStorage.connect();

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await mongoStorage.getUserByUsername(validated.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validated.password, 10);
      
      // Create user
      const user = await mongoStorage.createUser({
        ...validated,
        password: hashedPassword,
      });

      // Store user in session
      if (req.session) {
        req.session.userId = user._id;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid signup data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Find user
      const user = await mongoStorage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user in session
      if (req.session) {
        req.session.userId = user._id;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await mongoStorage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get user" });
    }
  });

  // Account management routes
  app.patch("/api/account", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validated = updateUserSchema.parse(req.body);
      
      // If password is being updated, hash it
      if (validated.password) {
        validated.password = await bcrypt.hash(validated.password, 10);
      }

      // If username is being changed, check if it's available
      if (validated.username) {
        const existingUser = await mongoStorage.getUserByUsername(validated.username);
        if (existingUser && existingUser._id !== req.session.userId) {
          return res.status(400).json({ error: "Username already exists" });
        }
      }

      // Remove undefined/null/empty values from updates
      const cleanUpdates = Object.fromEntries(
        Object.entries(validated).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      const updatedUser = await mongoStorage.updateUser(req.session.userId, cleanUpdates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid update data" });
    }
  });

  app.delete("/api/account", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const success = await mongoStorage.deleteUser(req.session.userId);
      if (success) {
        req.session.destroy(() => {});
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete account" });
    }
  });

  // Tip expense routes
  app.get("/api/tip-expenses", async (req, res) => {
    const expenses = await mongoStorage.getTipExpenses();
    res.json(expenses);
  });

  app.post("/api/tip-expenses", async (req, res) => {
    try {
      const validated = insertTipExpenseSchema.parse(req.body);
      const expense = await mongoStorage.createTipExpense(validated);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid tip expense data" });
    }
  });

  app.delete("/api/tip-expenses/:id", async (req, res) => {
    const success = await mongoStorage.deleteTipExpense(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Tip expense not found" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
