export interface User {
  id: string;
  email: string;
  assignedAgentId?: number;
  currentTopicIndex?: number;
  hasCompletedLiteracySurvey: boolean;
}

export interface Agent {
  id: number | string;
  name: string;
  description?: string;
  avatar?: string;
  emotionalIntelligence?: number;
  cognitiveIntelligence?: number;
}

export interface Topic {
  id: number | string;
  title: string;
  description?: string;
  stimulusText?: string;
  policyText?: string;
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
