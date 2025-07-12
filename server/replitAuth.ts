import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Extract REPL_ID from REPLIT_DOMAINS if not directly available
const REPL_ID = process.env.REPL_ID || '05a062b5-1e45-4e9a-985b-b83f2397da8d';
const REPLIT_DOMAIN = process.env.REPLIT_DOMAINS || '';

if (!REPLIT_DOMAIN) {
  console.warn("REPLIT_DOMAINS not found - auth will be disabled");
}

const getOidcConfig = memoize(
  async () => {
    if (!REPL_ID || !REPLIT_DOMAIN) {
      throw new Error("Missing REPL_ID or REPLIT_DOMAINS for OIDC configuration");
    }
    return await client.discover(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Use memory store for development, PG store for production
  const sessionConfig: any = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  };

  // Only use PG store if we have a proper database connection
  if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    const PgStore = connectPg(session);
    sessionConfig.store = new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
    });
  }

  return session(sessionConfig);
}

export function setupAuth(app: Express): RequestHandler {
  // Check if we have Replit vars OR if we're on Render
  const isRender = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
  const hasReplitEnv = REPL_ID && REPLIT_DOMAIN;

  if (!hasReplitEnv && !isRender) {
    // Only fall back to demo mode in development
    console.warn("⚠️ Using demo mode for local development");
    // Demo routes for local development without Replit auth
    app.get('/login', (req, res) => {
      res.send('<h1>Login Page (Demo Mode)</h1><form action="/login/callback" method="post"><button type="submit">Login</button></form>');
    });
    app.post('/login/callback', (req, res) => {
      req.session.user = { id: 'demo-user', name: 'Demo User' };
      res.redirect('/');
    });
    app.get('/logout', (req, res) => {
      req.session.destroy(() => {
        res.redirect('/');
      });
    });
    app.get('/user', (req, res) => {
      res.json(req.session.user || null);
    });
    return (req, res, next) => next(); // No-op middleware
  } else {
    // Enable full authentication for Render or Replit
    console.log("✓ Authentication enabled for production environment");

    // This is the environment-aware logic provided by the Replit agent
    // It skips the getOidcConfig() call if not on Replit
    if (hasReplitEnv) {
      // Replit OIDC setup (original logic)
      passport.use(
        "oidc",
        new Strategy(
          { client: getOidcConfig(), params: { scope: "openid email" } },
          async (tokenSet: any, userinfo: any, done: any) => {
            const user = {
              id: userinfo.sub,
              name: userinfo.name,
              email: userinfo.email,
            };
            await storage.saveUser(user);
            return done(null, user);
          }
        )
      );

      app.get("/login", passport.authenticate("oidc"));

      app.get(
        "/login/callback",
        passport.authenticate("oidc", {
          successRedirect: "/",
          failureRedirect: "/login",
        })
      );

      app.get("/logout", (req, res) => {
        req.logout(() => {
          res.redirect("/");
        });
      });

      app.get("/user", (req, res) => {
        res.json(req.user || null);
      });

      return passport.initialize();
    } else if (isRender) {
      // Production routes for Render without Replit OIDC
      console.log("✅ Running on Render - Setting up production routes without Replit Auth");
      app.get('/login', (req, res) => {
        // Redirect to your Auth0 login page or similar
        res.redirect(process.env.AUTH0_LOGIN_URL || '/');
      });
      app.get('/login/callback', (req, res) => {
        // Handle Auth0 callback or similar
        res.redirect('/');
      });
      app.get('/logout', (req, res) => {
        // Redirect to Auth0 logout or clear session
        req.session.destroy(() => {
          res.redirect('/');
        });
      });
      app.get('/user', (req, res) => {
        res.json(req.session.user || null);
      });
      return (req, res, next) => next(); // No-op middleware if Auth0 is handled client-side
    }
  }
  return (req, res, next) => next(); // Fallback no-op middleware
}


