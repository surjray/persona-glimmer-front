import { retry } from '@/utils/retry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Health check function to verify backend is available
async function checkBackendHealth(timeoutMs: number = 10000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error: any) {
    // Network error, timeout, or CORS - backend is not available
    return false;
  }
}

// Wait for backend to be available (for Render cold starts)
async function waitForBackend(maxWaitMs: number = 30000, checkIntervalMs: number = 2000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    if (await checkBackendHealth(5000)) {
      return true;
    }
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
  }
  
  return false;
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
  options: RequestInit = {},
  skipHealthCheck: boolean = false
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
    // For auth and admin endpoints, check backend health first (unless explicitly skipped)
    // Skip health check for the health endpoint itself to avoid infinite loop
    if (!skipHealthCheck && (endpoint.includes('/auth/') || endpoint.includes('/admin/')) && endpoint !== '/health') {
      const isHealthy = await checkBackendHealth(5000);
      if (!isHealthy) {
        // Backend might be waking up, wait a bit longer
        const backendAvailable = await waitForBackend(30000, 2000);
        if (!backendAvailable) {
          throw new Error(
            'Backend service is temporarily unavailable. This may be due to the service waking up. Please try again in a few moments.'
          );
        }
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    // Only log in development, and don't log sensitive endpoints
    if (import.meta.env.DEV && !endpoint.includes('/auth/')) {
      console.log('API Request:', endpoint, options.method || 'GET');
    }
    
    // Use retry for network errors and server errors (502, 503, 504)
    let response: Response;
    try {
      response = await retry(
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          try {
            const res = await fetch(url, {
              ...options,
              headers,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            
            // Retry on 502, 503, 504 (service unavailable, gateway errors)
            if (res.status === 502 || res.status === 503 || res.status === 504) {
              throw new Error(`Server error ${res.status}: Service may be starting up`);
            }
            
            return res;
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            throw fetchError;
          }
        },
        {
          maxRetries: 5, // More retries for cold starts
          delay: 2000, // Start with 2 second delay
          backoff: true,
          retryable: (error: any) => {
            // Retry on network errors, timeouts, and server errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
              return true;
            }
            if (error.name === 'AbortError') {
              return true; // Timeout
            }
            if (error.message?.includes('502') || error.message?.includes('503') || error.message?.includes('504')) {
              return true;
            }
            // CORS errors might indicate backend is down
            if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
              return true;
            }
            return false;
          },
        }
      );
    } catch (error: any) {
      // If retry failed, provide helpful error message
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error(
          'Unable to connect to the server. The backend service may be starting up. Please wait a moment and try again.'
        );
      }
      if (error.name === 'AbortError') {
        throw new Error(
          'Request timed out. The backend service may be taking longer than usual to respond. Please try again.'
        );
      }
      if (error.message?.includes('502') || error.message?.includes('503') || error.message?.includes('504')) {
        throw new Error(
          'Backend service is temporarily unavailable. It may be starting up. Please wait a moment and try again.'
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
    // Re-throw errors that were already handled above
    throw error;
  }
}

// Export health check for use in components
export const healthCheck = checkBackendHealth;
export const waitForBackendReady = waitForBackend;

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
        emotionalIntelligence: 'low' | 'medium' | 'high';
        cognitiveIntelligence: 'low' | 'medium' | 'high';
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
        emotionalIntelligence: 'low' | 'medium' | 'high';
        cognitiveIntelligence: 'low' | 'medium' | 'high';
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
        emotionalIntelligence: 'low' | 'medium' | 'high';
        cognitiveIntelligence: 'low' | 'medium' | 'high';
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

// Admin API
export const adminApi = {
  getDashboard: async () => {
    return apiRequest<{
      totalUsers: number;
      totalMessages: number;
      completedLiteracySurvey: number;
      totalInteractions: number;
      completedPostTopicSurveys: number;
      agentDistribution: Array<{ agentId: number; userCount: number }>;
    }>('/api/admin/dashboard', {
      headers: {
        'x-admin-api-key': 'backend123',
      },
    });
  },

  getAllUsers: async () => {
    return apiRequest<{
      users: Array<{
        id: string;
        email: string;
        assignedAgentId: number;
        agentEQ: 'low' | 'medium' | 'high';
        agentIQ: 'low' | 'medium' | 'high';
        currentTopicIndex: number;
        hasCompletedLiteracySurvey: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
      total: number;
    }>('/api/admin/users', {
      headers: {
        'x-admin-api-key': 'backend123',
      },
    });
  },

  getAllMessages: async (filters?: { userId?: string; topicId?: number; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.topicId) params.append('topicId', filters.topicId.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return apiRequest<{
      messages: Array<{
        id: string;
        userId: string;
        userEmail: string;
        topicId: number;
        topicTitle: string;
        role: 'user' | 'agent';
        content: string;
        timestamp: string;
      }>;
      total: number;
    }>(`/api/admin/messages${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'x-admin-api-key': 'backend123',
      },
    });
  },

  getAllLiteracySurveyResponses: async (userId?: string) => {
    const queryString = userId ? `?userId=${userId}` : '';
    return apiRequest<{
      responses: Array<{
        id: string;
        userId: string;
        userEmail: string;
        questionId: string;
        responseValue: string;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/admin/surveys/literacy${queryString}`, {
      headers: {
        'x-admin-api-key': 'backend123',
      },
    });
  },

  getAllPostTopicSurveyResponses: async (filters?: { userId?: string; topicId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.topicId) params.append('topicId', filters.topicId.toString());

    const queryString = params.toString();
    return apiRequest<{
      responses: Array<{
        id: string;
        userId: string;
        userEmail: string;
        topicId: number;
        topicTitle: string;
        questionId: string;
        responseValue: number;
        createdAt: string;
      }>;
      total: number;
    }>(`/api/admin/surveys/post-topic${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'x-admin-api-key': 'backend123',
      },
    });
  },

  getUserData: async (userId: string) => {
    return apiRequest<{
      user: {
        id: string;
        email: string;
        assignedAgentId: number;
        agentEQ: 'low' | 'medium' | 'high';
        agentIQ: 'low' | 'medium' | 'high';
        currentTopicIndex: number;
        hasCompletedLiteracySurvey: boolean;
        createdAt: string;
        updatedAt: string;
      };
      messages: Array<{
        id: string;
        topicId: number;
        topicTitle: string;
        role: 'user' | 'agent';
        content: string;
        timestamp: string;
      }>;
      literacySurveyResponses: Array<{
        questionId: string;
        responseValue: string;
      }>;
      postTopicSurveyResponses: Array<{
        topicId: number;
        topicTitle: string;
        questionId: string;
        responseValue: number;
      }>;
      progress: {
        completedTopics: number;
        totalInteractions: number;
      };
    }>(`/api/admin/users/${userId}`, {
      headers: {
        'x-admin-api-key': 'backend123',
      },
    });
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
