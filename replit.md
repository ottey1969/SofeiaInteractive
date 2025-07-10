# ContentScale AI Platform - Replit Development Guide

## Overview

ContentScale is an advanced AI-powered content writing platform that provides real-time AI visualization, SEO optimization, and competitive analysis. The platform is branded as "Sofeia AI" and features a sophisticated chat interface with live AI thinking processes, keyword research capabilities, and premium subscription features.

**Latest Enhancement (January 2025):** Integrated comprehensive Sofeia AI training prompt with C.R.A.F.T framework (Julia McCoy's methodology), Google AI Overview optimization, live competitor analysis, and copy-paste ready HTML formatting. The AI now follows advanced content creation protocols with real-time research capabilities and professional SEO optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

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