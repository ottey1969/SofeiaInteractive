// Add this after line 431 in routes.ts
app.post("/api/conversations", async (req, res) => {
  try {
    // Check database connection first
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: "Database not configured. Please contact support.",
        code: "DB_NOT_CONFIGURED"
      });
    }

    // For demo users, create a real conversation with demo_user
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      // Ensure demo_user exists in database
      try {
        await storage.upsertUser({
          id: "demo_user",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          isPremium: false,
          monthlyQuestionsUsed: 0,
          currentMonth: new Date().toISOString().slice(0, 7),
          isAdmin: false
        });
      } catch (upsertError) {
        console.error("Error creating demo user:", upsertError);
      }

      const conversation = await storage.createConversation("demo_user", {
        title: req.body.title || "New Chat"
      });
      return res.json(conversation);
    }

    const userId = req.user.claims.sub;
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Ensure user exists in database
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found, creating new user:", userId);
        await storage.upsertUser({
          id: userId,
          email: req.user.claims.email || null,
          firstName: req.user.claims.first_name || null,
          lastName: req.user.claims.last_name || null,
          profileImageUrl: req.user.claims.profile_image_url || null,
          isPremium: false,
          monthlyQuestionsUsed: 0,
          currentMonth: new Date().toISOString().slice(0, 7),
          isAdmin: userId === 'ottmar.francisca1969@gmail.com' || req.user.claims.email === 'ottmar.francisca1969@gmail.com'
        });
      }
    } catch (userError) {
      console.error("Error handling user:", userError);
      return res.status(500).json({ message: "Failed to initialize user" });
    }

    const validatedData = insertConversationSchema.parse(req.body);
    const conversation = await storage.createConversation(userId, { ...validatedData, userId });
    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    
    // Provide more specific error messages
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: "Invalid conversation data",
        details: error.issues
      });
    }
    
    res.status(500).json({
      message: "Failed to create conversation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
