import { retry } from '@/utils/retry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Debug: Log API URL in development
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
}

// Token management
const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    if (import.meta.env.DEV) {
      console.log('API Request:', url, options.method || 'GET');
    }
    
    // Use retry for network errors, but handle response errors separately
    let response: Response;
    try {
      response = await retry(
        async () => {
          const res = await fetch(url, {
            ...options,
            headers,
          });
          // Don't throw on HTTP errors here, let the code below handle them
          return res;
        },
        {
          maxRetries: 3,
          delay: 1000,
          backoff: true,
          retryable: (error) => {
            // Only retry on network errors
            return error.name === 'TypeError' && error.message.includes('fetch');
          },
        }
      );
    } catch (error: any) {
      // If retry failed, it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to server. Please ensure the backend is running at ${API_BASE_URL}`
        );
      }
      throw error;
    }

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Handle 401 Unauthorized (token expired/invalid)
      if (response.status === 401) {
        removeToken();
        // Dispatch custom event for auth failure
        window.dispatchEvent(new CustomEvent('auth-failed'));
        throw new Error('Your session has expired. Please login again to continue.');
      }

      // Handle 429 Too Many Requests (rate limiting)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const message = retryAfter
          ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
          : 'Too many requests. Please wait a moment before trying again.';
        throw new Error(message);
      }

      // Handle 400 Bad Request
      if (response.status === 400) {
        let errorMessage = 'Invalid request. Please check your input and try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // Use default message
        }
        throw new Error(errorMessage);
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      }

      // Handle 500 Internal Server Error
      if (response.status >= 500) {
        throw new Error('Server error. Please try again in a moment. If the problem persists, contact support.');
      }

      // Generic error handling
      let errorMessage = `An error occurred (${response.status}). Please try again.`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to server. Please ensure the backend is running at ${API_BASE_URL}`
      );
    }
    // Re-throw other errors
    throw error;
  }
}

// Auth API
export const authApi = {
  register: async (email: string, password: string) => {
    const response = await apiRequest<{
      user: {
        id: string;
        email: string;
        assignedAgentId: number;
        currentTopicIndex: number;
        hasCompletedLiteracySurvey: boolean;
      };
      agent: {
        id: number;
        name: string;
        emotionalIntelligence: number;
        cognitiveIntelligence: number;
      };
      token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      setToken(response.data.token);
    }

    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      user: {
        id: string;
        email: string;
        assignedAgentId: number;
        currentTopicIndex: number;
        hasCompletedLiteracySurvey: boolean;
      };
      agent: {
        id: number;
        name: string;
        emotionalIntelligence: number;
        cognitiveIntelligence: number;
      };
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      setToken(response.data.token);
    }

    return response.data;
  },

  logout: () => {
    removeToken();
  },

  requestPasswordReset: async (email: string) => {
    const response = await apiRequest<{
      message: string;
      token?: string; // Only in development
    }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiRequest<{
      message: string;
    }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    return response.data;
  },
};

// User API
export const userApi = {
  getState: async () => {
    return apiRequest<{
      user: {
        id: string;
        email: string;
        assignedAgentId: number;
        currentTopicIndex: number;
        hasCompletedLiteracySurvey: boolean;
      };
      agent: {
        id: number;
        name: string;
        emotionalIntelligence: number;
        cognitiveIntelligence: number;
      };
      currentTopic: {
        id: number;
        title: string;
        stimulusText: string;
        order: number;
      } | null;
      interactionStatus: {
        interactionCount: number;
        isLocked: boolean;
        surveyCompleted: boolean;
      } | null;
      progress: {
        completedTopics: number;
        totalTopics: number;
        completionPercentage: number;
        totalInteractions: number;
      };
    }>('/api/user/state');
  },
};

// Topic API
export const topicApi = {
  getAll: async () => {
    return apiRequest<{
      topics: Array<{
        id: number;
        title: string;
        stimulusText: string;
        order: number;
      }>;
    }>('/api/topics');
  },

  getCurrent: async () => {
    return apiRequest<{
      topic: {
        id: number;
        title: string;
        stimulusText: string;
        order: number;
      };
      interactionCount: number;
      isLocked: boolean;
      surveyCompleted: boolean;
    }>('/api/topics/current');
  },

  getById: async (id: number) => {
    return apiRequest<{
      topic: {
        id: number;
        title: string;
        stimulusText: string;
        order: number;
      };
    }>(`/api/topics/${id}`);
  },

  getWithStatus: async () => {
    return apiRequest<{
      topics: Array<{
        id: number;
        title: string;
        stimulusText: string;
        order: number;
        status: 'completed' | 'current' | 'locked' | 'accessible';
        interactionCount: number;
      }>;
    }>('/api/topics/with-status');
  },
};

// Guardrails API
export const guardrailApi = {
  getGuardrails: async () => {
    return apiRequest<{
      guardrails: {
        id: number;
        title: string;
        content: string;
      } | null;
    }>('/api/guardrails');
  },
};

// Chat API
export const chatApi = {
  sendMessage: async (topicId: number, content: string) => {
    return apiRequest<{
      userMessage: {
        id: string;
        content: string;
        role: 'user' | 'agent';
        timestamp: string;
      };
      agentMessage: {
        id: string;
        content: string;
        role: 'user' | 'agent';
        timestamp: string;
      };
      interactionCount: number;
      isLocked: boolean;
      shouldShowSurvey: boolean;
    }>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ topicId, content }),
    });
  },

  getHistory: async (topicId: number) => {
    return apiRequest<{
      messages: Array<{
        id: string;
        content: string;
        role: 'user' | 'agent';
        timestamp: string;
      }>;
    }>(`/api/chat/messages/${topicId}`);
  },

  getStatus: async (topicId: number) => {
    return apiRequest<{
      interactionCount: number;
      isLocked: boolean;
      surveyCompleted: boolean;
      maxInteractions: number;
    }>(`/api/chat/status/${topicId}`);
  },
};

// Survey API
export const surveyApi = {
  submitLiteracy: async (responses: Array<{ questionId: string; value: number | string }>) => {
    return apiRequest<{
      message: string;
      userState: {
        hasCompletedLiteracySurvey: boolean;
      };
    }>('/api/surveys/literacy', {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  },

  submitPostTopic: async (topicId: number, responses: Array<{ questionId: string; value: number }>) => {
    return apiRequest<{
      message: string;
      nextTopicUnlocked: boolean;
      nextTopicIndex: number;
    }>('/api/surveys/post-topic', {
      method: 'POST',
      body: JSON.stringify({ topicId, responses }),
    });
  },

  getLiteracyStatus: async () => {
    return apiRequest<{
      hasCompleted: boolean;
    }>('/api/surveys/literacy/status');
  },
};
