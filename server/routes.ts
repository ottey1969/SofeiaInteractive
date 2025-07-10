import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { researchKeywords, analyzeCompetitors, findAIOverviewOpportunities } from "./services/perplexity";
import { analyzeContent, generateContent, craftStrategy } from "./services/anthropic";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  conversationId?: number;
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if daily questions need to be reset
      const today = new Date();
      const lastQuestionDate = user?.lastQuestionDate ? new Date(user.lastQuestionDate) : null;
      
      if (!lastQuestionDate || lastQuestionDate.toDateString() !== today.toDateString()) {
        await storage.resetDailyQuestions(userId);
        const updatedUser = await storage.getUser(userId);
        return res.json(updatedUser);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // PayPal routes (will show proper error if API keys not configured)
  app.get("/api/paypal/setup", async (req, res) => {
    try {
      await loadPaypalDefault(req, res);
    } catch (error) {
      res.status(500).json({ message: "PayPal API keys not configured. Please add your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." });
    }
  });

  app.post("/api/paypal/order", async (req, res) => {
    try {
      await createPaypalOrder(req, res);
    } catch (error) {
      res.status(500).json({ message: "PayPal API keys not configured. Please add your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." });
    }
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    try {
      await capturePaypalOrder(req, res);
    } catch (error) {
      res.status(500).json({ message: "PayPal API keys not configured. Please add your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." });
    }
  });

  // Subscription routes
  app.post("/api/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paypalSubscriptionId, planType } = req.body;

      const subscription = await storage.createSubscription({
        userId,
        paypalSubscriptionId,
        status: "active",
        planType,
      });

      // Update user to premium
      await storage.upsertUser({
        id: userId,
        isPremium: true,
      });

      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse(req.body);
      
      const conversation = await storage.createConversation(userId, { ...validatedData, userId });
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/conversations/:id/activities", isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const activities = await storage.getConversationActivities(conversationId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Chat routes
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationId, message } = req.body;
      
      // Check user's daily limit
      const user = await storage.getUser(userId);
      if (!user?.isPremium && (user?.dailyQuestionsUsed || 0) >= 3) {
        return res.status(429).json({ 
          message: "Daily question limit reached. Upgrade to Pro for unlimited questions." 
        });
      }

      // Create user message
      await storage.createMessage(conversationId, {
        role: "user",
        content: message,
        conversationId
      });
      
      // Update user's question count
      const today = new Date();
      const newCount = (user?.dailyQuestionsUsed || 0) + 1;
      await storage.updateUserQuestionCount(userId, newCount, today);

      // Process AI response asynchronously
      processAIResponse(conversationId, message);
      
      res.json({ success: true, message: "Processing your request..." });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  // Research routes
  app.post("/api/research/keywords", isAuthenticated, async (req: any, res) => {
    try {
      const { topic, country } = req.body;
      const research = await researchKeywords(topic, country);
      res.json(research);
    } catch (error) {
      console.error("Error researching keywords:", error);
      res.status(500).json({ message: "Failed to research keywords" });
    }
  });

  app.post("/api/research/competitors", isAuthenticated, async (req: any, res) => {
    try {
      const { keyword, competitors } = req.body;
      const analysis = await analyzeCompetitors(keyword, competitors);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing competitors:", error);
      res.status(500).json({ message: "Failed to analyze competitors" });
    }
  });

  app.post("/api/research/ai-overview", isAuthenticated, async (req: any, res) => {
    try {
      const { topic } = req.body;
      const opportunities = await findAIOverviewOpportunities(topic);
      res.json(opportunities);
    } catch (error) {
      console.error("Error finding AI overview opportunities:", error);
      res.status(500).json({ message: "Failed to find AI overview opportunities" });
    }
  });

  // Content routes
  app.post("/api/content/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { content, keywords } = req.body;
      const analysis = await analyzeContent(content, keywords);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  app.post("/api/content/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, context } = req.body;
      const content = await generateContent(prompt, context);
      res.json({ content });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  app.post("/api/content/strategy", isAuthenticated, async (req: any, res) => {
    try {
      const requirements = req.body;
      const strategy = await craftStrategy(requirements);
      res.json(strategy);
    } catch (error) {
      console.error("Error crafting strategy:", error);
      res.status(500).json({ message: "Failed to craft strategy" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time AI activity updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'join_conversation') {
          ws.conversationId = data.conversationId;
          ws.userId = data.userId;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Function to broadcast AI activity updates
  global.broadcastAIActivity = (conversationId: number, activity: any) => {
    wss.clients.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN && client.conversationId === conversationId) {
        client.send(JSON.stringify({
          type: 'ai_activity',
          data: activity
        }));
      }
    });
  };

  return httpServer;
}

async function processAIResponse(conversationId: number, userMessage: string) {
  try {
    // Create research phase activity
    const researchActivity = await storage.createAIActivity({
      conversationId,
      phase: "research",
      status: "active",
      description: "Analyzing query and researching online resources..."
    });

    global.broadcastAIActivity?.(conversationId, researchActivity);

    // Determine if this is a keyword research request
    const isKeywordRequest = /keywords?|SEO|search|rank|compete/i.test(userMessage);
    
    let aiResponse = "";

    if (isKeywordRequest) {
      // Update research activity
      await storage.updateAIActivity(researchActivity.id, "active", {
        step: "keyword_research",
        description: "Performing keyword research with Perplexity AI..."
      });

      // Extract topic from user message
      const topic = userMessage.replace(/give me|find|keywords?|best|for|website|this/gi, '').trim();
      
      // Research keywords
      const keywordResearch = await researchKeywords(topic);
      
      // Complete research phase
      await storage.updateAIActivity(researchActivity.id, "completed");

      // Create analysis phase
      const analysisActivity = await storage.createAIActivity({
        conversationId,
        phase: "analysis",
        status: "active",
        description: "Analyzing keyword opportunities and competition..."
      });

      global.broadcastAIActivity?.(conversationId, analysisActivity);

      // Analyze competitors for top keywords
      const topKeyword = keywordResearch.keywords[0]?.keyword || topic;
      const competitorAnalysis = await analyzeCompetitors(topKeyword);

      await storage.updateAIActivity(analysisActivity.id, "completed");

      // Create strategy phase
      const strategyActivity = await storage.createAIActivity({
        conversationId,
        phase: "strategy",
        status: "active",
        description: "Crafting comprehensive SEO strategy..."
      });

      global.broadcastAIActivity?.(conversationId, strategyActivity);

      // Generate comprehensive response
      aiResponse = await generateContent(`Based on this keyword research and competitor analysis, provide a comprehensive SEO strategy:

Keyword Research Results:
${JSON.stringify(keywordResearch, null, 2)}

Competitor Analysis:
${JSON.stringify(competitorAnalysis, null, 2)}

User Query: ${userMessage}

Provide actionable recommendations following the C.R.A.F.T framework.`);

      await storage.updateAIActivity(strategyActivity.id, "completed");
    } else {
      // General content generation
      await storage.updateAIActivity(researchActivity.id, "completed");

      const generationActivity = await storage.createAIActivity({
        conversationId,
        phase: "generation",
        status: "active",
        description: "Generating high-quality content response..."
      });

      global.broadcastAIActivity?.(conversationId, generationActivity);

      aiResponse = await generateContent(userMessage);

      await storage.updateAIActivity(generationActivity.id, "completed");
    }

    // Create AI response message
    await storage.createMessage(conversationId, {
      role: "assistant",
      content: aiResponse,
      conversationId
    });

    // Broadcast completion
    global.broadcastAIActivity?.(conversationId, {
      type: "response_complete",
      message: aiResponse
    });

  } catch (error) {
    console.error("Error processing AI response:", error);
    
    // Create error message
    await storage.createMessage(conversationId, {
      role: "assistant",
      content: "I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.",
      conversationId
    });

    global.broadcastAIActivity?.(conversationId, {
      type: "error",
      message: "Failed to process request"
    });
  }
}

// Global types for WebSocket broadcasting
declare global {
  var broadcastAIActivity: ((conversationId: number, activity: any) => void) | undefined;
}
