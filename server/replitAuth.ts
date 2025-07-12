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
    return await client.discovery(
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
    const pgStore = connectPg(session);
    sessionConfig.store = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  }

  return session(sessionConfig);
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  console.log("🔧 Setting up authentication...");
  
  app.set("trust proxy", 1);
  
  // Initialize session and passport
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up passport session handling
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Detect hosting environment
  const isReplit = REPL_ID && REPLIT_DOMAIN;
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER === 'true';
  
  console.log("Environment detection:");
  console.log("- Replit:", isReplit ? "✓" : "✗");
  console.log("- Production:", isProduction ? "✓" : "✗");
  console.log("- Render:", isRender ? "✓" : "✗");

  // Production/Render hosting - skip Replit OIDC setup
  if ((isProduction || isRender) && !isReplit) {
    console.log("✅ Setting up production authentication routes");
    
    app.get("/api/login", (req, res) => {
      console.log("Production login endpoint accessed");
      res.redirect("/?auth=production");
    });
    
    app.get("/api/callback", (req, res) => {
      console.log("Production callback endpoint accessed");
      res.redirect("/");
    });
    
    app.get("/api/logout", (req, res) => {
      console.log("Production logout endpoint accessed");
      if (req.session) {
        req.session.destroy(() => {
          res.redirect("/");
        });
      } else {
        res.redirect("/");
      }
    });
    
    console.log("✅ Production authentication configured successfully");
    return;
  }

  // Development/Demo mode - no auth required
  if (!isReplit && !isProduction) {
    console.log("🔧 Setting up demo mode routes");
    
    app.get("/api/login", (req, res) => {
      console.log("Demo mode: Login redirected");
      res.redirect("/?demo=true");
    });
    
    app.get("/api/callback", (req, res) => {
      console.log("Demo mode: Callback redirected"); 
      res.redirect("/?demo=true");
    });
    
    app.get("/api/logout", (req, res) => {
      if (req.session) {
        req.session.destroy(() => {
          res.redirect("/");
        });
      } else {
        res.redirect("/");
      }
    });
    
    console.log("✅ Demo mode configured successfully");
    return;
  }

  // Replit hosting - full OIDC setup
  try {
    console.log("🔧 Setting up Replit OIDC authentication...");
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    // Set up Replit auth strategies
    for (const domain of REPLIT_DOMAIN.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    app.get("/api/login", (req, res, next) => {
      const hostname = req.hostname;
      const strategyName = `replitauth:${hostname}`;
      
      if (!passport._strategies[strategyName]) {
        console.warn(`Strategy ${strategyName} not found, redirecting to demo`);
        return res.redirect("/?demo=true&message=auth-unavailable");
      }
      
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      const hostname = req.hostname;
      const strategyName = `replitauth:${hostname}`;
      
      passport.authenticate(strategyName, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/?demo=true&message=auth-failed",
      })(req, res, (err) => {
        if (err) {
          console.error("Authentication callback error:", err);
          return res.redirect("/?demo=true&message=auth-error");
        }
        next();
      });
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: REPL_ID,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });

    console.log("✅ Replit OIDC authentication configured successfully");
  } catch (error) {
    console.error("❌ Failed to setup Replit Auth:", error);
    console.log("🔄 Falling back to demo mode...");
    
    // Fallback routes
    app.get("/api/login", (req, res) => {
      res.redirect("/?demo=true&message=auth-fallback");
    });
    
    app.get("/api/callback", (req, res) => {
      res.redirect("/?demo=true&message=auth-fallback");
    });
    
    app.get("/api/logout", (req, res) => {
      if (req.session) {
        req.session.destroy(() => res.redirect("/"));
      } else {
        res.redirect("/");
      }
    });
    
    console.log("✅ Fallback authentication configured");
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
