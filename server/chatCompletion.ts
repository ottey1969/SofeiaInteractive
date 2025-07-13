import { storage } from "./storage";
import { generateContent } from "./services/anthropic";
import { researchKeywords } from "./services/perplexity";

export interface ChatCompletionRequest {
  conversationId: number;
  message: string;
  messageType?: 'simple' | 'research' | 'complex';
}

export interface ChatCompletionResponse {
  message: {
    id: number;
    conversationId: number;
    role: 'assistant';
    content: string;
    createdAt: string;
  };
  questionsRemaining?: number;
}

export class ChatCompletionService {
  async createChatCompletion(
    userId: string,
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const { conversationId, message, messageType = 'simple' } = request;

    // Store user message first
    await storage.createMessage(conversationId, {
      role: 'user',
      content: message,
    });

    // Get conversation history for context
    const messages = await storage.getConversationMessages(conversationId);
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let aiResponse: string;

    try {
      // Handle different message types with appropriate speed
      if (messageType === 'simple') {
        // For simple questions, use direct Anthropic without research
        aiResponse = await generateContent(message, { 
          conversationHistory,
          type: 'simple_response'
        });
      } else if (messageType === 'research') {
        // For research questions, use Perplexity first then Anthropic
        try {
          const researchData = await researchKeywords(message);
          aiResponse = await generateContent(message, { 
            conversationHistory,
            researchData,
            type: 'research_response'
          });
        } catch (researchError) {
          console.warn('Research failed, falling back to direct response:', researchError);
          aiResponse = await generateContent(message, { 
            conversationHistory,
            type: 'simple_response'
          });
        }
      } else {
        // For complex questions, use full pipeline
        try {
          const researchData = await researchKeywords(message);
          aiResponse = await generateContent(message, { 
            conversationHistory,
            researchData,
            type: 'complex_response'
          });
        } catch (researchError) {
          console.warn('Research failed, falling back to direct response:', researchError);
          aiResponse = await generateContent(message, { 
            conversationHistory,
            type: 'simple_response'
          });
        }
      }
    } catch (error) {
      console.error('AI response generation failed:', error);
      aiResponse = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.";
    }

    // Store AI response
    const aiMessage = await storage.createMessage(conversationId, {
      role: 'assistant',
      content: aiResponse,
    });

    // Check user's question limits
    const user = await storage.getUser(userId);
    let questionsRemaining: number | undefined;
    
    if (user && !user.isPremium) {
      const today = new Date().toISOString().slice(0, 10);
      const dailyCount = user.lastQuestionDate === today ? (user.dailyQuestionsUsed || 0) + 1 : 1;
      
      await storage.updateUserQuestionCount(userId, dailyCount);
      questionsRemaining = Math.max(0, 3 - dailyCount);
    }

    return {
      message: aiMessage,
      questionsRemaining
    };
  }

  categorizeMessage(message: string): 'simple' | 'research' | 'complex' {
    const lowerMessage = message.toLowerCase();
    
    // Simple questions - direct answers
    const simplePatterns = [
      /^(what is|what are|define|explain|how to|can you|is it|are there)/,
      /^(yes|no|maybe|sure|ok|okay|thanks|thank you)/,
      /^(hi|hello|hey|good morning|good afternoon|good evening)/,
      /^(help|support|contact|about)/
    ];

    // Research questions - need external data
    const researchPatterns = [
      /(competitor|competition|market|industry|trends|latest|recent|current|news)/,
      /(keyword research|seo|search volume|ranking|serp|google)/,
      /(price|cost|pricing|budget|compare|vs|versus)/,
      /(statistics|data|numbers|metrics|analytics)/
    ];

    // Check for simple patterns first
    if (simplePatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'simple';
    }

    // Check for research patterns
    if (researchPatterns.some(pattern => pattern.test(lowerMessage))) {
      return 'research';
    }

    // Default to complex for longer, detailed questions
    if (message.length > 100) {
      return 'complex';
    }

    return 'simple';
  }
}

export const chatCompletionService = new ChatCompletionService();

