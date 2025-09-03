/**
 * Conversation state management for Mr. Ahmadi AI chat sessions
 * Manages chat history, analysis status, and session data
 */

import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string[];
  timestamp: Date;
}

export interface ConversationSession {
  sessionId: string;
  userId?: string;
  userName: string;
  history: ChatMessage[];
  analysis_sent: boolean;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'analyzing' | 'completed';
}

// In-memory storage for chat sessions (can be replaced with database later)
// Use global to persist across hot reloads in development
const globalForSessions = globalThis as typeof globalThis & {
  conversationSessions?: Map<string, ConversationSession>;
};

if (!globalForSessions.conversationSessions) {
  globalForSessions.conversationSessions = new Map<string, ConversationSession>();
}

const conversationSessions = globalForSessions.conversationSessions;

// Session timeout in milliseconds (2 hours for development)
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

export class ConversationManager {
  /**
   * Create a new conversation session
   */
  static createSession(userName: string, userId?: string): ConversationSession {
    const sessionId = uuidv4();
    const now = new Date();
    
    const session: ConversationSession = {
      sessionId,
      userId,
      userName,
      history: [],
      analysis_sent: false,
      created_at: now,
      updated_at: now,
      status: 'active'
    };
    
    conversationSessions.set(sessionId, session);
    console.log(`Created session ${sessionId}, total sessions: ${conversationSessions.size}`);
    
    // Clean up old sessions - but not too aggressively
    // this.cleanupExpiredSessions();
    
    return session;
  }
  
  /**
   * Get conversation session by ID
   */
  static getSession(sessionId: string): ConversationSession | null {
    console.log(`Getting session: ${sessionId}`);
    console.log(`Total sessions in memory: ${conversationSessions.size}`);
    
    const session = conversationSessions.get(sessionId);
    
    if (!session) {
      console.log(`Session ${sessionId} not found in memory`);
      return null;
    }
    
    // Check if session has expired
    const now = new Date();
    const timeSinceUpdate = now.getTime() - session.updated_at.getTime();
    console.log(`Session ${sessionId} last updated: ${session.updated_at}, time since: ${timeSinceUpdate}ms`);
    
    if (timeSinceUpdate > SESSION_TIMEOUT) {
      console.log(`Session ${sessionId} expired, removing`);
      conversationSessions.delete(sessionId);
      return null;
    }
    
    console.log(`Session ${sessionId} found and valid`);
    return session;
  }
  
  /**
   * Add message to conversation history
   */
  static addMessage(sessionId: string, role: 'user' | 'model', content: string): boolean {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return false;
    }
    
    const message: ChatMessage = {
      role,
      parts: [content],
      timestamp: new Date()
    };
    
    session.history.push(message);
    session.updated_at = new Date();
    
    conversationSessions.set(sessionId, session);
    
    return true;
  }
  
  /**
   * Get conversation history in Gemini API format
   */
  static getHistoryForGemini(sessionId: string): { role: 'user' | 'model'; parts: string[] }[] {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return [];
    }
    
    return session.history.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));
  }
  
  /**
   * Mark analysis as sent for a session
   */
  static markAnalysisSent(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return false;
    }
    
    session.analysis_sent = true;
    session.status = 'completed';
    session.updated_at = new Date();
    
    conversationSessions.set(sessionId, session);
    
    return true;
  }
  
  /**
   * Update session status
   */
  static updateStatus(sessionId: string, status: 'active' | 'analyzing' | 'completed'): boolean {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return false;
    }
    
    session.status = status;
    session.updated_at = new Date();
    
    conversationSessions.set(sessionId, session);
    
    return true;
  }
  
  /**
   * Get conversation history as JSON string (for analysis)
   */
  static getHistoryAsJson(sessionId: string): string {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return '[]';
    }
    
    return JSON.stringify(session.history, null, 2);
  }
  
  /**
   * Delete a conversation session
   */
  static deleteSession(sessionId: string): boolean {
    return conversationSessions.delete(sessionId);
  }
  
  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = new Date();
    
    for (const [sessionId, session] of conversationSessions.entries()) {
      if (now.getTime() - session.updated_at.getTime() > SESSION_TIMEOUT) {
        conversationSessions.delete(sessionId);
      }
    }
  }
  
  /**
   * Get all active sessions (for admin purposes)
   */
  static getAllActiveSessions(): ConversationSession[] {
    const activeSessions: ConversationSession[] = [];
    
    for (const session of conversationSessions.values()) {
      if (session.status === 'active' || session.status === 'analyzing') {
        activeSessions.push(session);
      }
    }
    
    return activeSessions;
  }
  
  /**
   * Check if session needs analysis (has enough conversation data)
   */
  static shouldTriggerAnalysis(sessionId: string): boolean {
    const session = this.getSession(sessionId);
    
    if (!session || session.analysis_sent || session.status === 'completed') {
      return false;
    }
    
    // Minimum criteria: at least 4 exchanges (2 user messages, 2 model responses)
    const userMessages = session.history.filter(msg => msg.role === 'user');
    const modelMessages = session.history.filter(msg => msg.role === 'model');
    
    return userMessages.length >= 2 && modelMessages.length >= 2;
  }
}
