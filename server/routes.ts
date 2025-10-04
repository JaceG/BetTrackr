import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTipExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/tip-expenses", async (req, res) => {
    const expenses = await storage.getTipExpenses();
    res.json(expenses);
  });

  app.post("/api/tip-expenses", async (req, res) => {
    try {
      const validated = insertTipExpenseSchema.parse(req.body);
      const expense = await storage.createTipExpense(validated);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid tip expense data" });
    }
  });

  app.delete("/api/tip-expenses/:id", async (req, res) => {
    const success = await storage.deleteTipExpense(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Tip expense not found" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
