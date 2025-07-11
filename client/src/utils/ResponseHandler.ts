/**
 * ResponseHandler class - Handles message categorization and loading states
 * Implements the smart categorization from code_implementations.md
 */

export type MessageType = 'simple' | 'analysis' | 'complex';

export class ResponseHandler {
  private simplePatterns: RegExp[];
  private complexPatterns: RegExp[];

  constructor() {
    this.simplePatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
      /^(thanks|thank you|thx|ty)/i,
      /^(bye|goodbye|see you)/i,
      /^(yes|no|ok|okay|sure)/i,
      /^(test|testing)/i,
      /^.{1,15}$/ // Very short messages
    ];
    
    this.complexPatterns = [
      /keyword research|keywords|search volume/i,
      /competitor analysis|competitors|serp analysis/i,
      /backlinks|link building|domain authority/i,
      /market research|industry analysis/i,
      /content strategy|content plan|editorial calendar/i,
      /seo strategy|optimization plan/i,
      /analyze|research|investigate/i
    ];
  }

  categorizeMessage(message: string): MessageType {
    const trimmed = message.trim().toLowerCase();
    
    // Check for simple patterns
    for (const pattern of this.simplePatterns) {
      if (pattern.test(trimmed)) {
        return 'simple';
      }
    }
    
    // Check for complex patterns
    for (const pattern of this.complexPatterns) {
      if (pattern.test(trimmed)) {
        return 'complex';
      }
    }
    
    // Default to analysis for medium complexity
    if (trimmed.length > 100) {
      return 'analysis';
    }
    
    return 'simple';
  }

  getLoadingMessage(type: MessageType, message?: string): string {
    switch (type) {
      case 'simple':
        return 'Processing your message...';
      case 'analysis':
        return 'Analyzing your request...';
      case 'complex':
        return 'Researching and analyzing...';
      default:
        return 'Processing...';
    }
  }

  shouldShowResearchPhases(type: MessageType): boolean {
    return type === 'complex' || type === 'analysis';
  }

  getExpectedResponseTime(type: MessageType): number {
    switch (type) {
      case 'simple':
        return 1000; // 1 second
      case 'analysis':
        return 5000; // 5 seconds
      case 'complex':
        return 10000; // 10 seconds
      default:
        return 3000;
    }
  }
}

// Export singleton instance
export const responseHandler = new ResponseHandler();