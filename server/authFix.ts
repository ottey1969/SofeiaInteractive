// Authentication fix for Replit environment
import type { Express, RequestHandler } from "express";
import session from "express-session";

export function setupSimpleAuth(app: Express) {
  console.log("🔧 Setting up simplified authentication...");
  
  // Simple session configuration that works reliably
  app.use(session({
    secret: process.env.SESSION_SECRET || \'fallback-secret-for-dev\',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for development
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
  } ));

  // Simple login redirect (no passport)
  app.get("/api/login", (req, res) => {
    console.log("🔄 Login attempt redirected to demo mode");
    res.redirect("/?demo=true&message=auth-unavailable");
  });

  // Simple logout
  app.get("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(() => {
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  });

  console.log("✅ Simplified auth setup complete");
}

// Simple auth middleware that works with demo mode
export const simpleAuth: RequestHandler = (req, res, next) => {
  // Always allow demo mode to work
  next();
};
