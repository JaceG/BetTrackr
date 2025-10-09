import type { Express } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongo-storage";
import { 
  insertTipExpenseSchema, 
  insertUserSchema, 
  updateUserSchema,
  insertBettingEntrySchema,
  insertCapitalInjectionSchema,
  insertUserSettingsSchema,
  updateUserSettingsSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

// Middleware to check for active subscription
async function requireActiveSubscription(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await mongoStorage.getUser(req.session.userId);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(403).json({ error: "Active subscription required" });
    }

    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    
    if (!isActive) {
      return res.status(403).json({ error: "Active subscription required" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: "Active subscription required" });
  }
}

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
        // Convert ObjectId to string for comparison
        if (existingUser && existingUser._id.toString() !== req.session.userId) {
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

  // Stripe subscription routes
  app.post('/api/create-subscription', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await mongoStorage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If user already has a subscription, retrieve it
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: (invoice.payment_intent as any)?.client_secret,
          status: subscription.status,
        });
        return;
      }

      // Create Stripe customer if doesn't exist
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: { userId: user._id },
        });
        customerId = customer.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: process.env.STRIPE_SUBSCRIPTION || '',
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await mongoStorage.updateUserStripeInfo(user._id, customerId, subscription.id);

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice?.payment_intent?.client_secret,
        status: subscription.status,
      });
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      res.status(500).json({ error: error.message || 'Failed to create subscription' });
    }
  });

  // Check subscription status
  app.get('/api/subscription-status', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await mongoStorage.getUser(req.session.userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.json({ hasActiveSubscription: false });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      
      res.json({ 
        hasActiveSubscription: isActive,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      });
    } catch (error: any) {
      console.error('Subscription status error:', error);
      res.json({ hasActiveSubscription: false });
    }
  });

  // Betting entries routes (available to all authenticated users)
  app.get("/api/betting-entries", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const entries = await mongoStorage.getBettingEntries(req.session.userId);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get betting entries" });
    }
  });

  app.post("/api/betting-entries", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validated = insertBettingEntrySchema.parse(req.body);
      const entry = await mongoStorage.createBettingEntry(req.session.userId, validated);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid betting entry data" });
    }
  });

  app.delete("/api/betting-entries/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const success = await mongoStorage.deleteBettingEntry(req.session.userId, req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Betting entry not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete betting entry" });
    }
  });

  app.delete("/api/betting-entries", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      await mongoStorage.deleteAllBettingEntries(req.session.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete all betting entries" });
    }
  });

  // Capital injections routes (available to all authenticated users)
  app.get("/api/capital-injections", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const injections = await mongoStorage.getCapitalInjections(req.session.userId);
      res.json(injections);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get capital injections" });
    }
  });

  app.post("/api/capital-injections", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validated = insertCapitalInjectionSchema.parse(req.body);
      const injection = await mongoStorage.createCapitalInjection(req.session.userId, validated);
      res.json(injection);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid capital injection data" });
    }
  });

  app.delete("/api/capital-injections/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const success = await mongoStorage.deleteCapitalInjection(req.session.userId, req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Capital injection not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete capital injection" });
    }
  });

  app.delete("/api/capital-injections", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      await mongoStorage.deleteAllCapitalInjections(req.session.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete all capital injections" });
    }
  });

  // User settings routes (available to all authenticated users)
  app.get("/api/settings", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const settings = await mongoStorage.getUserSettings(req.session.userId);
      if (settings) {
        res.json(settings);
      } else {
        res.status(404).json({ error: "Settings not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validated = insertUserSettingsSchema.parse(req.body);
      const settings = await mongoStorage.createUserSettings(req.session.userId, validated);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid settings data" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validated = updateUserSettingsSchema.parse(req.body);
      const settings = await mongoStorage.updateUserSettings(req.session.userId, validated);
      if (settings) {
        res.json(settings);
      } else {
        res.status(404).json({ error: "Settings not found" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid settings data" });
    }
  });

  // Tip expense routes (available to all authenticated users)
  app.get("/api/tip-expenses", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const expenses = await mongoStorage.getTipExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get tip expenses" });
    }
  });

  app.post("/api/tip-expenses", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const validated = insertTipExpenseSchema.parse(req.body);
      const expense = await mongoStorage.createTipExpense(validated);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid tip expense data" });
    }
  });

  app.delete("/api/tip-expenses/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const success = await mongoStorage.deleteTipExpense(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Tip expense not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete tip expense" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
