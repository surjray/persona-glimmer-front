export interface User {
  id: string;
  email: string;
  hasCompletedLiteracySurvey: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  policyText: string;
  order: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  category?: string;
}

export interface SurveyResponse {
  questionId: string;
  value: number; // 1-7 Likert scale
}

export interface Guardrails {
  id: string;
  title: string;
  content: string;
}

export interface AppState {
  currentView: 'auth' | 'literacy-survey' | 'chat';
  user: User | null;
  currentTopicIndex: number;
  currentAgent: Agent | null;
  interactionCount: number;
  messages: Message[];
  showPostTopicSurvey: boolean;
}
