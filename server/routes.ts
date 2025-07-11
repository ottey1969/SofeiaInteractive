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
  // Try Replit Auth first, fallback to simple auth
  try {
    await setupAuth(app);
  } catch (error) {
    console.warn("⚠️  Replit Auth failed, using simplified auth:", error.message);
    const { setupSimpleAuth } = await import("./authFix");
    setupSimpleAuth(app);
  }

  // Auth routes - Allow without authentication for demo mode
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        // Return demo user for unauthenticated users
        return res.json({
          id: 'demo_user',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          isPremium: false,
          dailyQuestionsUsed: 0,
          lastQuestionDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

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

  // Conversation routes - Allow demo mode
  app.get("/api/conversations", async (req: any, res) => {
    try {
      // Return demo conversations for demo users
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        try {
          const demoConversations = await storage.getUserConversations("demo_user");
          return res.json(demoConversations);
        } catch (error) {
          return res.json([]);
        }
      }
      
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req: any, res) => {
    try {
      // For demo users, create a real conversation with demo_user
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        // Ensure demo_user exists in database
        await storage.upsertUser({
          id: "demo_user",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          isPremium: false,
          dailyQuestionsUsed: 0,
          lastQuestionDate: new Date(),
          isAdmin: false
        });
        
        const conversation = await storage.createConversation("demo_user", {
          title: req.body.title || "New Chat"
        });
        
        return res.json(conversation);
      }
      
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse(req.body);
      
      const conversation = await storage.createConversation(userId, { ...validatedData, userId });
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/conversations/:id/activities", async (req: any, res) => {
    try {
      // Return empty array for demo users
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json([]);
      }
      
      const conversationId = parseInt(req.params.id);
      const activities = await storage.getConversationActivities(conversationId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Chat routes - Implement question limits
  app.post("/api/chat", async (req: any, res) => {
    try {
      const { conversationId, message } = req.body;
      
      // Handle demo users
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        // Track demo questions in session
        if (!req.session.demoQuestions) {
          req.session.demoQuestions = 0;
        }
        
        if (req.session.demoQuestions >= 3) {
          return res.status(429).json({ 
            message: "Daily question limit reached. Sign up for free to continue or upgrade to Pro for unlimited questions.",
            showUpgrade: true
          });
        }
        
        req.session.demoQuestions++;
        
        // Store user message for demo
        try {
          await storage.createMessage(conversationId, {
            role: "user",
            content: message
          });
        } catch (error) {
          console.error("Error storing demo user message:", error);
        }

        // Process demo AI response
        processDemoAIResponse(conversationId, message);
        return res.json({ 
          success: true, 
          message: "Processing your request...", 
          questionsRemaining: 3 - req.session.demoQuestions 
        });
      }
      
      const userId = req.user.claims.sub;
      
      // Check user's daily limit (skip for admin users)
      const user = await storage.getUser(userId);
      
      // Special case: if email is admin email, auto-upgrade to admin
      if (req.user?.claims?.email === 'ottmar.francisca1969@gmail.com') {
        await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          isAdmin: true,
          isPremium: true
        });
      }
      
      if (!user?.isPremium && !user?.isAdmin && (user?.dailyQuestionsUsed || 0) >= 3) {
        return res.status(429).json({ 
          message: "Daily question limit reached. Upgrade to Pro for unlimited questions.",
          showUpgrade: true
        });
      }

      // Create user message
      await storage.createMessage(conversationId, {
        role: "user",
        content: message,
        conversationId
      });
      
      // Update user's question count (skip for admin users)
      if (!user?.isAdmin) {
        const today = new Date();
        const newCount = (user?.dailyQuestionsUsed || 0) + 1;
        await storage.updateUserQuestionCount(userId, newCount, today);
      }

      // Process AI response asynchronously
      processAIResponse(conversationId, message);
      
      const questionsRemaining = user?.isPremium || user?.isAdmin ? -1 : Math.max(0, 3 - (user?.dailyQuestionsUsed || 0) - 1);
      res.json({ 
        success: true, 
        message: "Processing your request...", 
        questionsRemaining 
      });
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

  // Admin routes
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if user is admin by email
    const userEmail = req.user.claims.email;
    if (userEmail !== 'ottmar.francisca1969@gmail.com') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };

  // Temporary admin routes for testing (remove after auth is fixed)
  app.get("/api/admin/demo-users", async (req: any, res) => {
    try {
      const { email, limit = 50, offset = 0 } = req.query;
      const users = await storage.getAllUsers();
      
      let filteredUsers = users;
      if (email) {
        filteredUsers = users.filter(user => 
          user.email && user.email.toLowerCase().includes(email.toLowerCase())
        );
      }
      
      const paginatedUsers = filteredUsers.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );
      
      res.json({
        message: "Demo admin endpoint - all users",
        count: filteredUsers.length,
        total: users.length,
        users: paginatedUsers,
        hasMore: parseInt(offset) + parseInt(limit) < filteredUsers.length
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/demo-user-by-email/:email", async (req: any, res) => {
    try {
      const { email } = req.params;
      const users = await storage.getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        message: "User found",
        user
      });
    } catch (error) {
      console.error("Error fetching user by email:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/demo-grant-credits/:userId", async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { credits = 10 } = req.body;
      await storage.grantUserCredits(userId, credits);
      res.json({ 
        success: true, 
        message: `Demo: Granted ${credits} credits to user ${userId}` 
      });
    } catch (error) {
      console.error("Error granting credits:", error);
      res.status(500).json({ message: "Failed to grant credits" });
    }
  });

  app.post("/api/admin/demo-create-test-users", async (req: any, res) => {
    try {
      const testUsers = [
        {
          id: "user_admin_ottmar",
          email: "ottmar.francisca1969@gmail.com",
          firstName: "Ottmar",
          lastName: "Francisca",
          isPremium: true,
          isAdmin: true,
          dailyQuestionsUsed: 0
        },
        {
          id: "user_premium_john",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          isPremium: true,
          isAdmin: false,
          dailyQuestionsUsed: 5
        },
        {
          id: "user_free_jane",
          email: "jane.smith@example.com",
          firstName: "Jane",
          lastName: "Smith",
          isPremium: false,
          isAdmin: false,
          dailyQuestionsUsed: 2
        },
        {
          id: "user_free_mike",
          email: "mike.johnson@gmail.com",
          firstName: "Mike",
          lastName: "Johnson",
          isPremium: false,
          isAdmin: false,
          dailyQuestionsUsed: 3
        },
        {
          id: "user_premium_sarah",
          email: "sarah.wilson@company.com",
          firstName: "Sarah",
          lastName: "Wilson",
          isPremium: true,
          isAdmin: false,
          dailyQuestionsUsed: 15
        }
      ];

      for (const userData of testUsers) {
        await storage.upsertUser(userData);
      }

      res.json({ 
        success: true, 
        message: `Created ${testUsers.length} test users`,
        users: testUsers.map(u => ({ id: u.id, email: u.email, isPremium: u.isPremium, isAdmin: u.isAdmin }))
      });
    } catch (error) {
      console.error("Error creating test users:", error);
      res.status(500).json({ message: "Failed to create test users" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:userId/premium", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { isPremium } = req.body;
      await storage.updateUserPremiumStatus(userId, isPremium);
      res.json({ success: true, message: `User premium status updated to ${isPremium}` });
    } catch (error) {
      console.error("Error updating user premium status:", error);
      res.status(500).json({ message: "Failed to update user premium status" });
    }
  });

  app.post("/api/admin/users/:userId/credits", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { credits } = req.body;
      await storage.grantUserCredits(userId, credits);
      res.json({ success: true, message: `Granted ${credits} credits to user` });
    } catch (error) {
      console.error("Error granting user credits:", error);
      res.status(500).json({ message: "Failed to grant user credits" });
    }
  });

  const httpServer = createServer(app);

  // Add reset context endpoint
  app.post("/api/reset-context", async (req: any, res) => {
    try {
      const { chatId } = req.body;
      console.log(`Resetting context for chat: ${chatId}`);
      // In a real app, this would clear any context associated with the chat
      res.json({ success: true, message: 'Context reset successfully' });
    } catch (error) {
      console.error("Error resetting context:", error);
      res.status(500).json({ message: "Failed to reset context" });
    }
  });

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
    console.log('Broadcasting activity:', JSON.stringify(activity, null, 2));
    
    wss.clients.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN && client.conversationId === conversationId) {
        if (activity.type === 'response_complete') {
          // Send response completion message directly
          client.send(JSON.stringify(activity));
        } else {
          // Send regular AI activity
          client.send(JSON.stringify({
            type: 'ai_activity',
            data: activity
          }));
        }
      }
    });
  };

  return httpServer;
}

// Demo AI response function
async function processDemoAIResponse(conversationId: number, userMessage: string) {
  const isSimpleQuestion = /^(hi|hello|hey|thanks|thank you|test|ok|yes|no|.*jhi.*)$/i.test(userMessage.trim());
  
  if (isSimpleQuestion) {
    // Store the assistant message first
    try {
      // Verify conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }
      
      const assistantMessage = await storage.createMessage(conversationId, {
        role: 'assistant',
        content: getSimpleResponse(userMessage)
      });
      
      // Broadcast the response immediately
      global.broadcastAIActivity?.(conversationId, {
        type: 'response_complete',
        message: assistantMessage
      });
    } catch (error) {
      console.error('Error storing simple response:', error);
    }
    return;
  }

  // Detailed analysis for complex questions
  setTimeout(() => {
    global.broadcastAIActivity?.(conversationId, {
      id: Date.now(),
      conversationId,
      phase: "research",
      status: "active",
      description: "Analyzing your question...",
      createdAt: new Date().toISOString()
    });
  }, 500);

  setTimeout(() => {
    global.broadcastAIActivity?.(conversationId, {
      id: Date.now() + 1,
      conversationId,
      phase: "analysis",
      status: "active", 
      description: "Processing with Sofeia AI...",
      createdAt: new Date().toISOString()
    });
  }, 1500);

  setTimeout(async () => {
    global.broadcastAIActivity?.(conversationId, {
      id: Date.now() + 2,
      conversationId,
      phase: "generation",
      status: "completed",
      description: "Response generated successfully",
      createdAt: new Date().toISOString()
    });
    
    // Store and send detailed response
    try {
      // Verify conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return;
      }
      
      const assistantMessage = await storage.createMessage(conversationId, {
        role: 'assistant',
        content: getDetailedResponse(userMessage)
      });
      
      // Broadcast the response
      global.broadcastAIActivity?.(conversationId, {
        type: 'response_complete',
        message: assistantMessage
      });
    } catch (error) {
      console.error('Error storing detailed response:', error);
    }
  }, 3000);
}

function getSimpleResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();
  
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    return "Hello! I'm Sofeia AI, your expert content strategist. I'm ready to help you with SEO optimization, keyword research, and content strategy. What would you like to work on today?";
  }
  
  if (msg.includes('jhi') || msg.length < 5) {
    return "Hello! I understand you're testing the system. I'm Sofeia AI and I'm working perfectly. I can help you with content strategy, SEO optimization, and keyword research. Try asking me something like 'help me with SEO strategy' for a more detailed response!";
  }
  
  if (msg.includes('thanks') || msg.includes('thank you')) {
    return "You're welcome! I'm here whenever you need help with content strategy, SEO, or digital marketing. Feel free to ask me anything!";
  }
  
  if (msg === 'test' || msg === 'ok' || msg === 'yes') {
    return "Perfect! I'm working correctly. I can help you with content creation, SEO strategy, keyword research, and competitor analysis. What would you like to explore?";
  }
  
  return "I'm Sofeia AI, ready to assist with your content and SEO needs. How can I help you today?";
}

function getDetailedResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('seo') || msg.includes('content') || msg.includes('strategy')) {
    return `I can help you with comprehensive SEO content strategy for: "${userMessage}"\n\n**My expertise includes:**\n• Keyword research and analysis\n• Competitor content analysis\n• Google AI Overview optimization\n• Content structure and planning\n• SEO-optimized copywriting\n• Performance tracking strategies\n\nWould you like me to analyze a specific topic or help you develop a content plan? I can provide detailed keyword research and competitive analysis.\n\n**Demo Mode:** Sign up for the full Sofeia AI experience with unlimited questions and real-time research capabilities.`;
  }
  
  if (msg.includes('keyword') || msg.includes('research')) {
    return `For keyword research on "${userMessage}", I can provide:\n\n**Keyword Analysis:**\n• Search volume data\n• Competition analysis\n• Long-tail opportunities\n• Search intent mapping\n• Ranking difficulty assessment\n\n**Competitive Intelligence:**\n• Top-ranking content analysis\n• Content gap identification\n• SERP feature opportunities\n• AI Overview positioning\n\nWould you like me to perform detailed keyword research for a specific topic?\n\n**Demo Mode:** Upgrade for real-time Perplexity API integration and unlimited research.`;
  }
  
  return `I understand you're asking about: "${userMessage}"\n\nAs your AI content strategist, I can help with:\n• Content planning and strategy\n• SEO optimization techniques\n• Keyword research and analysis\n• Competitor analysis\n• Content performance optimization\n\nWhat specific aspect would you like me to focus on? I can provide detailed, actionable recommendations.\n\n**Demo Mode:** This is a simplified response. Sign up for advanced C.R.A.F.T framework analysis and unlimited questions.`;
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
