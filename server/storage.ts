import {
  users,
  conversations,
  messages,
  aiActivities,
  subscriptions,
  type User,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type AIActivity,
  type InsertAIActivity,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserQuestionCount(userId: string, count: number, date: Date): Promise<void>;
  resetDailyQuestions(userId: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void>;
  grantUserCredits(userId: string, credits: number): Promise<void>;
  
  // Conversation operations
  createConversation(userId: string, conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  updateConversationTitle(id: number, title: string): Promise<void>;
  
  // Message operations
  createMessage(conversationId: number, message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // AI Activity operations
  createAIActivity(activity: InsertAIActivity): Promise<AIActivity>;
  updateAIActivity(id: number, status: string, metadata?: any): Promise<void>;
  getConversationActivities(conversationId: number): Promise<AIActivity[]>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  updateSubscriptionStatus(userId: string, status: string): Promise<void>;
  
  // Blog post operations
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getUserBlogPosts(userId: string): Promise<BlogPost[]>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<void>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Bulk blog job operations
  createBulkBlogJob(job: InsertBulkBlogJob): Promise<BulkBlogJob>;
  getBulkBlogJob(id: number): Promise<BulkBlogJob | undefined>;
  getUserBulkBlogJobs(userId: string): Promise<BulkBlogJob[]>;
  updateBulkBlogJob(id: number, updates: Partial<BulkBlogJob>): Promise<void>;
  deleteBulkBlogJob(id: number): Promise<void>;
  getBlogPostsByJobId(jobId: number): Promise<BlogPost[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if this is the admin email
    const isAdminEmail = userData.email === 'ottmar.francisca1969@gmail.com';
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        isAdmin: userData.isAdmin ?? isAdminEmail,
        isPremium: userData.isPremium ?? isAdminEmail, // Preserve user's premium status or set admin
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          isAdmin: userData.isAdmin ?? isAdminEmail,
          isPremium: userData.isPremium ?? isAdminEmail,
          dailyQuestionsUsed: userData.dailyQuestionsUsed,
          lastQuestionDate: userData.lastQuestionDate,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserQuestionCount(userId: string, count: number, date: Date): Promise<void> {
    await db
      .update(users)
      .set({
        dailyQuestionsUsed: count,
        lastQuestionDate: date,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async resetDailyQuestions(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        dailyQuestionsUsed: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async createConversation(userId: string, conversation: InsertConversation): Promise<Conversation> {
    const [conv] = await db
      .insert(conversations)
      .values({ 
        title: conversation.title,
        userId 
      })
      .returning();
    return conv;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async updateConversationTitle(id: number, title: string): Promise<void> {
    await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async createMessage(conversationId: number, message: InsertMessage): Promise<Message> {
    const [msg] = await db
      .insert(messages)
      .values({ ...message, conversationId })
      .returning();
    return msg;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createAIActivity(activity: InsertAIActivity): Promise<AIActivity> {
    const [act] = await db
      .insert(aiActivities)
      .values(activity)
      .returning();
    return act;
  }

  async updateAIActivity(id: number, status: string, metadata?: any): Promise<void> {
    await db
      .update(aiActivities)
      .set({ status: status as "pending" | "active" | "completed" | "failed", metadata })
      .where(eq(aiActivities.id, id));
  }

  async getConversationActivities(conversationId: number): Promise<AIActivity[]> {
    return await db
      .select()
      .from(aiActivities)
      .where(eq(aiActivities.conversationId, conversationId))
      .orderBy(aiActivities.createdAt);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [sub] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return sub;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));
    return subscription;
  }

  async updateSubscriptionStatus(userId: string, status: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ status: status as "active" | "cancelled" | "expired" })
      .where(eq(subscriptions.userId, userId));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
    await db.update(users)
      .set({ 
        isPremium,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async grantUserCredits(userId: string, credits: number): Promise<void> {
    // Reset daily questions to 0 (grant unlimited for the day)
    await db.update(users)
      .set({ 
        dailyQuestionsUsed: 0,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Blog post operations
  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(blogPost)
      .returning();
    return post;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return post;
  }

  async getUserBlogPosts(userId: string): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.userId, userId))
      .orderBy(desc(blogPosts.createdAt));
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<void> {
    await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id));
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id));
  }

  // Bulk blog job operations
  async createBulkBlogJob(job: InsertBulkBlogJob): Promise<BulkBlogJob> {
    const [blogJob] = await db
      .insert(bulkBlogJobs)
      .values(job)
      .returning();
    return blogJob;
  }

  async getBulkBlogJob(id: number): Promise<BulkBlogJob | undefined> {
    const [job] = await db
      .select()
      .from(bulkBlogJobs)
      .where(eq(bulkBlogJobs.id, id));
    return job;
  }

  async getUserBulkBlogJobs(userId: string): Promise<BulkBlogJob[]> {
    return await db
      .select()
      .from(bulkBlogJobs)
      .where(eq(bulkBlogJobs.userId, userId))
      .orderBy(desc(bulkBlogJobs.createdAt));
  }

  async updateBulkBlogJob(id: number, updates: Partial<BulkBlogJob>): Promise<void> {
    await db
      .update(bulkBlogJobs)
      .set(updates)
      .where(eq(bulkBlogJobs.id, id));
  }

  async deleteBulkBlogJob(id: number): Promise<void> {
    // First delete all associated blog posts
    await db
      .delete(blogPosts)
      .where(eq(blogPosts.bulkJobId, id));
    
    // Then delete the job
    await db
      .delete(bulkBlogJobs)
      .where(eq(bulkBlogJobs.id, id));
  }

  async getBlogPostsByJobId(jobId: number): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.bulkJobId, jobId))
      .orderBy(desc(blogPosts.createdAt));
  }
}

export const storage = new DatabaseStorage();
