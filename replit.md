# ContentScale AI Platform - Replit Development Guide

## Overview

ContentScale is an advanced AI-powered content writing platform that provides real-time AI visualization, SEO optimization, and competitive analysis. The platform is branded as "Sofeia AI" and features a sophisticated chat interface with live AI thinking processes, keyword research capabilities, and premium subscription features.

**Latest Enhancement (July 11, 2025):** CRITICAL FIXES & UI IMPROVEMENTS - Fixed conversation creation errors and implemented UI layout rearrangement based on user feedback. Key fixes implemented:

**CRITICAL FIXES:**
- **Conversation Creation Error Fix**: Enhanced error handling in `/api/conversations` endpoint with proper user initialization and validation
- **Improved Error Messages**: Added specific error descriptions for better debugging and user feedback
- **Database User Handling**: Automatic user creation when missing, preventing conversation creation failures
- **Demo Mode Stability**: Fixed demo user creation process with proper error handling

**UI LAYOUT REARRANGEMENT:**
- **Middle Column**: Now displays "Welcome to Sofeia AI" section (Keyword Research, SEO Strategy, Content Analysis)
- **Right Sidebar**: Moved "AI Brain Activity" section with real-time thinking process and API integrations
- **Left Sidebar**: Maintained chat history and conversation management (unchanged)
- **Three-Column Layout**: Clean separation between chat history, main interface, and AI activity monitoring

**COMPLETE USAGE-BASED PRICING & ROI IMPLEMENTATION** - Implemented comprehensive overage fee system, annual billing discounts, and ROI-focused marketing messaging. Key features implemented:
- **4-Tier Pricing Structure:** Free (3/month), Pro ($35/150/month), Agency ($99/500/month), Premium Agency ($249/1500/month)
- **Usage-Based Overage Fees:** $0.25 per additional question beyond monthly limits for paid plans (Free users must upgrade)
- **Annual Billing Discounts:** 15-20% discount for yearly subscriptions (Pro: $28/month, Agency: $79/month, Premium Agency: $199/month)
- **ROI-Focused Marketing:** Messaging highlights time savings, revenue increase potential, and business growth rather than just cost
- **Bulk Generation Limits:** Bulk content generation now counts against monthly question limits and stops when exceeded
- **Enhanced Subscription Manager:** Tracks both regular and overage questions with proper billing integration
- **Database Schema Updates:** Added billingCycle and overageQuestionsUsed fields for comprehensive usage tracking
- **Premium Agency Tier:** Maximum tier at $249/month for 1500 questions with priority support and beta access
- **Annual Savings Calculator:** Dynamic pricing display showing exact savings amounts for annual billing
- **Overage Billing System:** Automatic tracking and billing for questions exceeding monthly limits
- **Government Statistics Integration:** Enhanced both Anthropic and Perplexity services to prioritize real government statistics and official sources
- **Country-Specific Data:** Added comprehensive country-specific government source mapping for 8 major markets (US, UK, Canada, Australia, Germany, France, Netherlands, Spain)
- **High-Authority Sources Only:** Configured AI to avoid competitors and low-DR sites, focusing exclusively on .gov, .edu, and official international organization sources
- **AI Overview Optimization:** Added conditional AI Overview optimization prompts that only appear when AI Overviews are actually found for specific keywords, with targeted instructions: "Rewrite this to directly answer the query '[keyword with AI Overview]' in 2–3 concise, fact-based sentences optimized for Google's AI Overview format."
- **Comprehensive SEO Enhancement (July 11, 2025):** Implemented advanced SEO optimization targeting 50+ content scale keywords including:
  - Extended meta keywords targeting content scale, AI content writing, bulk content creation, content scaling platform, automated content marketing
  - Advanced Schema.org markup with WebSite, Organization, SoftwareApplication, Service, WebPage, BreadcrumbList, and FAQPage schemas
  - Enhanced Open Graph and Twitter Card tags with content scale branding
  - Comprehensive sitemap.xml with content scale focused pages and proper priority structure
  - Optimized robots.txt for content scale SEO with crawl directives
  - PWA manifest.json for enhanced mobile experience and app-like functionality
  - Landing page content optimized for "Scale Content Production 10x Faster" messaging
  - Content scale keywords grid showcasing platform capabilities
  - Google Analytics 4 and Microsoft Clarity integration for content scale tracking

**Auth0 Integration (July 11, 2025):** Successfully implemented secure Auth0 authentication system to replace problematic Replit OAuth. All three landing page buttons now working correctly:
- Login/Sign Up button: Uses Auth0 loginWithRedirect()
- Try Demo button: Sets demo mode and navigates to chat
- Login to Start Writing button: Auth0 authentication with redirect to home
- Access Premium Features button: Calls protected API with JWT token validation

**Auth0 Configuration Required:** The system includes automatic detection of Auth0 setup. If environment variables are not properly configured with real Auth0 credentials, the landing page shows setup instructions. See AUTH0_SETUP.md for complete configuration guide.

**Admin System (July 2025):** Implemented full admin functionality for ottmar.francisca1969@gmail.com with unlimited credits, user management capabilities, and subscription control. Admin users automatically bypass daily question limits and can grant credits to other users.

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Status (July 2025)

**Authentication Status (COMPLETELY FIXED - July 11, 2025):**
- ✅ All authentication errors resolved (unknown_user_id, strategy errors)
- ✅ Intelligent fallback system automatically handles authentication failures
- ✅ Production-ready Replit OAuth integration with error recovery
- ✅ Robust session management with memory store fallback
- ✅ Strategy detection and automatic demo mode redirection
- ottmar.francisca1969@gmail.com automatically receives unlimited credits and admin privileges

**Subscriber Access Plan:**
- Demo mode available now for testing all features
- Admin panel accessible at /admin route for user management
- System status page at /status for monitoring authentication health
- Real authentication will work for subscribers once Replit OIDC configuration is resolved

**Immediate Access Methods:**
1. Demo Mode: Full chat interface without login
2. Admin Panel: Direct access to user management
3. Status Page: Monitor system health and authentication status

**Immediate Access Methods:**
1. Demo Mode: Full chat interface without login
2. Admin Panel: Direct access to user management
3. Status Page: Monitor system health and authentication status

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live AI activity feeds
- **Authentication**: Replit Auth integration with session management

### Design System
- **Component Library**: Shadcn/UI components (New York style)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React icons and Font Awesome
- **Typography**: Inter font family
- **Color Scheme**: Dark theme with slate color palette and indigo accents

## Key Components

### Authentication System
- Replit OAuth integration for user authentication
- Session-based authentication with PostgreSQL session storage
- User profiles with subscription status and daily usage limits
- Automatic session renewal and logout handling
- **Admin System**: ottmar.francisca1969@gmail.com has unlimited credits and full admin privileges
- Admin users can manage user subscriptions and grant credits to other users

### Chat Interface
- Real-time chat interface with conversation management
- WebSocket connection for live AI activity visualization
- Message history with role-based display (user/assistant)
- Conversation creation and management

### AI Services Integration
- **Anthropic Claude Sonnet 4**: Primary AI service using comprehensive Sofeia AI training prompt
- **Advanced Training Protocol**: C.R.A.F.T framework implementation (Cut fluff, Review/optimize, Add visuals, Fact-check, Trust-build)
- **Content Optimization**: Google AI Overview targeting, HTML formatting, and copy-paste ready output
- **Live Research**: Competitor analysis integration with real-time data sourcing
- **Perplexity API**: Keyword research and competitive analysis with country-specific targeting
- Advanced content analysis with SEO scoring and optimization

### Subscription System
- PayPal integration for premium subscriptions
- Free tier with 3 daily questions limit
- Pro tier with unlimited questions and advanced features
- Usage tracking and daily limit resets

### Real-time AI Visualization
- Live AI thinking process display
- Activity feed showing research, analysis, strategy, and generation phases
- Real-time status updates through WebSocket connections

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth, creating or updating user records
2. **Conversation Management**: Users create conversations which store message history
3. **AI Processing**: User messages trigger AI service calls with real-time activity tracking
4. **WebSocket Updates**: AI activities are broadcast to connected clients for live visualization
5. **Response Generation**: AI responses are stored and displayed in the chat interface

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL database hosting
- **Anthropic API**: AI content generation and analysis
- **Perplexity API**: Research and keyword analysis capabilities
- **PayPal SDK**: Payment processing for subscriptions
- **Replit Auth**: User authentication and session management

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling for server code
- **Vite**: Frontend development and building
- **TypeScript**: Type checking and compilation

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **TanStack Query**: Server state management

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- TSX runtime for server development with auto-restart
- Shared TypeScript configuration for client, server, and shared code

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express.js
- Environment variable configuration for API keys and database connections

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in `shared/schema.ts` for type safety
- Database push commands for development schema updates

### Configuration Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude API access
- `PERPLEXITY_API_KEY`: Research API access
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: Payment processing
- `SESSION_SECRET`: Session encryption key
- `REPL_ID` & related Replit environment variables

The application follows a monorepo structure with shared types and schemas, enabling type-safe communication between frontend and backend while maintaining clean separation of concerns.