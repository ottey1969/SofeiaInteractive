import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// These variables should only be used if hasReplitEnv is true
// We will ensure they are not used to trigger getOidcConfig when not on Replit
const REPL_ID_RAW = process.env.REPL_ID;
const REPLIT_DOMAIN_RAW = process.env.REPLIT_DOMAINS;

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
  const isRender = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
  // Check for actual Replit environment variables, not placeholders
  const hasReplitEnv = !!REPL_ID_RAW && !!REPLIT_DOMAIN_RAW;

  if (isRender) {
    // Production routes for Render without Replit OIDC
    console.log("✅ Running on Render - Setting up production routes without Replit Auth");
    app.get('/login', (req, res) => {
      // Redirect to your Auth0 login page or similar
      res.redirect(process.env.AUTH0_LOGIN_URL || '/');
    });
    app.post('/login/callback', (req, res) => {
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
  } else if (hasReplitEnv) {
    // Replit OIDC setup (original logic)
    console.log("✓ Authentication enabled for Replit environment");

    // Define getOidcConfig here, so it's only created if hasReplitEnv is true
    // and ensure it's not memoized at the global scope
    const getOidcConfigInternal = async () => {
      // Use the raw Replit environment variables here
      if (!REPL_ID_RAW || !REPLIT_DOMAIN_RAW) {
        throw new Error("Missing REPL_ID or REPLIT_DOMAINS for OIDC configuration");
      }
      return await client.discover(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        REPL_ID_RAW
      );
    };
    const getOidcConfig = memoize(getOidcConfigInternal, { maxAge: 3600 * 1000 });

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
  } else {
    // Only fall back to demo mode in development if neither Render nor Replit envs are detected
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
  }
}




