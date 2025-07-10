export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isPremium: boolean;
  dailyQuestionsUsed: number;
  lastQuestionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface AIActivity {
  id: number;
  conversationId: number;
  phase: 'research' | 'analysis' | 'strategy' | 'generation';
  status: 'pending' | 'active' | 'completed' | 'failed';
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface KeywordResearch {
  keywords: Array<{
    keyword: string;
    searchVolume: string;
    competition: string;
    intent: string;
    difficulty: string;
  }>;
  topPages: Array<{
    url: string;
    title: string;
    snippet: string;
    hasAIOverview: boolean;
  }>;
  recommendations: string[];
  citations: string[];
}

export interface WebSocketMessage {
  type: 'ai_activity' | 'response_complete' | 'error' | 'join_conversation';
  data?: any;
  conversationId?: number;
  userId?: string;
  message?: string;
}
