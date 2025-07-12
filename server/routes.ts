import { type Request, type Response, Express } from "express";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  app.post("/api/conversations", async (req: Request, res: Response) => {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    const userId = req.user?.claims?.sub;

    // Validate request body
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Ensure user exists in database
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found, creating new user:", userId);
        await storage.upsertUser({
          id: userId,
          email: req.user?.claims?.email || null,
          firstName: req.user?.claims?.given_name || null,
          lastName: req.user?.claims?.family_name || null,
          isPremium: false,
          monthlyQuestionsUsed: 0,
          currentMonth: new Date().toISOString().slice(0, 7),
          isAdmin: false,
        });
      }
    } catch (error) {
      console.error("Error ensuring user exists:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Create conversation
    try {
      const conversation = await storage.createConversation(userId, {
        title: req.body.title || "New Chat",
      });
      return res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/conversations", async (req: Request, res: Response) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    const userId = req.user?.claims?.sub;
    try {
      const conversations = await storage.getConversations(userId);
      return res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(
    "/api/conversations/:conversationId",
    async (req: Request, res: Response) => {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({
          error: "Database not configured. Please contact support.",
          code: "DB_NOT_CONFIGURED",
        });
      }

      const conversationId = req.params.conversationId;

      const userId = req.user?.claims?.sub;
      try {
        const conversation = await storage.getConversation(
          userId,
          conversationId
        );
        return res.json(conversation);
      } catch (error) {
        console.error("Error getting conversation:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post(
    "/api/conversations/:conversationId/messages",
    async (req: Request, res: Response) => {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({
          error: "Database not configured. Please contact support.",
          code: "DB_NOT_CONFIGURED",
        });
      }

      const conversationId = req.params.conversationId;
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Message text is required" });
      }

      const userId = req.user?.claims?.sub;
      try {
        const message = await storage.createMessage(
          userId,
          conversationId,
          text
        );
        return res.json(message);
      } catch (error) {
        console.error("Error creating message:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get(
    "/api/conversations/:conversationId/messages",
    async (req: Request, res: Response) => {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({
          error: "Database not configured. Please contact support.",
          code: "DB_NOT_CONFIGURED",
        });
      }

      const conversationId = req.params.conversationId;

      const userId = req.user?.claims?.sub;
      try {
        const messages = await storage.getMessages(userId, conversationId);
        return res.json(messages);
      } catch (error) {
        console.error("Error getting messages:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.post("/api/chat", async (req: Request, res: Response) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res
        .status(400)
        .json({ message: "Conversation ID and message are required" });
    }

    const userId = req.user?.claims?.sub;
    try {
      const response = await storage.createChatCompletion(
        userId,
        conversationId,
        message
      );
      return res.json(response);
    } catch (error) {
      console.error("Error creating chat completion:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/paypal/create-order", async (req: Request, res: Response) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const order = await storage.createPaypalOrder(userId);
      return res.json(order);
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(
    "/api/paypal/complete-order",
    async (req: Request, res: Response) => {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({
          error: "Database not configured. Please contact support.",
          code: "DB_NOT_CONFIGURED",
        });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      try {
        const capture = await storage.completePaypalOrder(userId, orderId);
        return res.json(capture);
      } catch (error) {
        console.error("Error completing PayPal order:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.get("/api/usage", async (req: Request, res: Response) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    const userId = req.user?.claims?.sub;
    try {
      const usage = await storage.getUsage(userId);
      return res.json(usage);
    } catch (error) {
      console.error("Error getting usage:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    const userId = req.user?.claims?.sub;
    try {
      const user = await storage.getUser(userId);
      return res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED",
      });
    }

    // Clear the session or token here if applicable
    res.status(200).json({ message: "Logged out successfully" });
  });
}
