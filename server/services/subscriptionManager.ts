import { storage } from '../storage';

export interface SubscriptionLimits {
  dailyQuestions: number;
  hasUnlimitedQuestions: boolean;
  features: string[];
}

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  
  public static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  private getSubscriptionLimits(subscriptionType: string): SubscriptionLimits {
    switch (subscriptionType.toLowerCase()) {
      case 'free':
        return {
          dailyQuestions: 3,
          hasUnlimitedQuestions: false,
          features: ['basic_seo', 'simple_keywords', 'email_support']
        };
      
      case 'pro':
        return {
          dailyQuestions: -1, // unlimited
          hasUnlimitedQuestions: true,
          features: [
            'unlimited_questions',
            'advanced_seo',
            'comprehensive_keywords', 
            'competitor_analysis',
            'content_strategy',
            'priority_support',
            'export_reports'
          ]
        };
      
      case 'agency':
        return {
          dailyQuestions: -1, // unlimited
          hasUnlimitedQuestions: true,
          features: [
            'unlimited_questions',
            'team_collaboration',
            'whitelabel_reports',
            'api_access',
            'custom_integrations',
            'dedicated_manager',
            'phone_support',
            'custom_training'
          ]
        };
      
      default:
        return this.getSubscriptionLimits('free');
    }
  }

  public async checkQuestionLimit(userId: string): Promise<{
    canAsk: boolean;
    questionsRemaining: number;
    resetTime?: Date;
    subscriptionType: string;
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Admin users have unlimited access
      if (user.isAdmin) {
        return {
          canAsk: true,
          questionsRemaining: -1,
          subscriptionType: 'admin'
        };
      }

      const subscription = await storage.getUserSubscription(userId);
      const subscriptionType = subscription?.status === 'active' ? subscription.planId : 'free';
      const limits = this.getSubscriptionLimits(subscriptionType);

      // Unlimited questions for paid plans
      if (limits.hasUnlimitedQuestions) {
        return {
          canAsk: true,
          questionsRemaining: -1,
          subscriptionType
        };
      }

      // Check daily limits for free users
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const lastQuestionDate = user.lastQuestionDate ? new Date(user.lastQuestionDate).toISOString().split('T')[0] : null;

      // Reset count if it's a new day
      if (lastQuestionDate !== todayStr) {
        await storage.resetDailyQuestions(userId);
        return {
          canAsk: true,
          questionsRemaining: limits.dailyQuestions - 1,
          resetTime: this.getNextResetTime(),
          subscriptionType
        };
      }

      // Check if user has questions remaining
      const questionsRemaining = Math.max(0, limits.dailyQuestions - user.dailyQuestionsUsed);
      
      return {
        canAsk: questionsRemaining > 0,
        questionsRemaining,
        resetTime: this.getNextResetTime(),
        subscriptionType
      };

    } catch (error) {
      console.error('Error checking question limit:', error);
      return {
        canAsk: false,
        questionsRemaining: 0,
        subscriptionType: 'error'
      };
    }
  }

  public async incrementQuestionCount(userId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Don't increment for admin users
      if (user.isAdmin) {
        return;
      }

      const subscription = await storage.getUserSubscription(userId);
      const subscriptionType = subscription?.status === 'active' ? subscription.planId : 'free';
      const limits = this.getSubscriptionLimits(subscriptionType);

      // Don't increment for unlimited plans
      if (limits.hasUnlimitedQuestions) {
        return;
      }

      // Increment daily question count
      const newCount = user.dailyQuestionsUsed + 1;
      await storage.updateUserQuestionCount(userId, newCount, new Date());

    } catch (error) {
      console.error('Error incrementing question count:', error);
    }
  }

  public async grantUserCredits(adminUserId: string, targetUserId: string, credits: number): Promise<boolean> {
    try {
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser?.isAdmin) {
        throw new Error('Only admin users can grant credits');
      }

      await storage.grantUserCredits(targetUserId, credits);
      return true;

    } catch (error) {
      console.error('Error granting credits:', error);
      return false;
    }
  }

  public async createSubscription(userId: string, planId: string, paymentMethod: string): Promise<boolean> {
    try {
      await storage.createSubscription({
        userId,
        planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.getNextBillingDate(planId),
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update user premium status
      await storage.updateUserPremiumStatus(userId, true);
      
      return true;

    } catch (error) {
      console.error('Error creating subscription:', error);
      return false;
    }
  }

  public async cancelSubscription(userId: string): Promise<boolean> {
    try {
      await storage.updateSubscriptionStatus(userId, 'cancelled');
      await storage.updateUserPremiumStatus(userId, false);
      return true;

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private getNextBillingDate(planId: string): Date {
    const nextBilling = new Date();
    
    switch (planId.toLowerCase()) {
      case 'pro':
      case 'agency':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case 'pro_annual':
      case 'agency_annual':
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
      default:
        nextBilling.setMonth(nextBilling.getMonth() + 1);
    }
    
    return nextBilling;
  }

  public getFeatureAccess(subscriptionType: string, feature: string): boolean {
    const limits = this.getSubscriptionLimits(subscriptionType);
    return limits.features.includes(feature);
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();