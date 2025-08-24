// Types for the new backend system
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  age?: number;
  education_level?: string;
  work_experience?: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: number;
  user_id: number;
  questionnaire_id: number;
  score: number;
  max_score: number;
  level?: string;
  description?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  assessment_id: number;
  user_id: number;
  message_type: 'user' | 'ai1' | 'ai2';
  content: string;
  character_name?: string;
  created_at: string;
}

export interface AnalysisResult {
  totalScore: number;
  maxScore: number;
  questionAnalysis: Array<{
    question: string;
    score: number;
    reasoning: string;
  }>;
  assessment: {
    level: string;
    description: string;
    color?: string;
    bgColor?: string;
    icon?: string;
  };
}

export interface AuthToken {
  user: User;
  token: string;
  expiresAt: string;
}