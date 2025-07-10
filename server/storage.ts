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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
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
      .values({ ...conversation, userId })
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
}

export const storage = new DatabaseStorage();
