import { useState, useCallback, useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AgentIntroduction } from '@/components/auth/AgentIntroduction';
import { SurveyModal } from '@/components/survey/SurveyModal';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { PolicyPanel } from '@/components/layout/PolicyPanel';
import { Message, SurveyResponse, AppState, Agent, Topic } from '@/types';
import {
  aiLiteracySurveyQuestions,
  postTopicSurveyQuestions,
  globalGuardrails,
} from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap, Loader2 } from 'lucide-react';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { TopicListModal } from '@/components/layout/TopicListModal';
import { authApi, userApi, topicApi, chatApi, surveyApi, removeToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const MAX_INTERACTIONS = 10;

export default function Index() {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>({
    currentView: 'auth',
    user: null,
    currentTopicIndex: 0,
    currentAgent: null,
    interactionCount: 0,
    messages: [],
    showPostTopicSurvey: false,
  });
  
  const [showPolicyPanel, setShowPolicyPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [progress, setProgress] = useState({ completedTopics: 0, totalTopics: 20, completionPercentage: 0, totalInteractions: 0 });
  const [showTopicList, setShowTopicList] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [showAgentIntroduction, setShowAgentIntroduction] = useState(false);

  // Handle auth failures globally
  useEffect(() => {
    const handleAuthFailed = () => {
      removeToken();
      setAppState({
        currentView: 'auth',
        user: null,
        currentTopicIndex: 0,
        currentAgent: null,
        interactionCount: 0,
        messages: [],
        showPostTopicSurvey: false,
      });
      setCurrentTopic(null);
      setAllTopics([]);
      toast({
        title: 'Session expired',
        description: 'Please login again to continue',
        variant: 'destructive',
      });
    };

    window.addEventListener('auth-failed', handleAuthFailed);
    return () => window.removeEventListener('auth-failed', handleAuthFailed);
  }, [toast]);

  // Load user state on mount if token exists
  useEffect(() => {
    const loadUserState = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const stateResponse = await userApi.getState();
        const { user, agent, currentTopic: topic, interactionStatus, progress: progressData } = stateResponse.data;
        
        // Set progress
        if (progressData) {
          setProgress(progressData);
        }

        // Convert agent from backend format
        const agentData: Agent = {
          id: agent.id,
          name: agent.name,
          emotionalIntelligence: agent.emotionalIntelligence,
          cognitiveIntelligence: agent.cognitiveIntelligence,
        };

        // Convert topic from backend format
        let topicData: Topic | null = null;
        if (topic) {
          topicData = {
            id: topic.id,
            title: topic.title,
            stimulusText: topic.stimulusText,
            order: topic.order,
          };
          setCurrentTopic(topicData);
        }

        // Load all topics
        const topicsResponse = await topicApi.getAll();
        const topicsList = topicsResponse.data.topics.map((t) => ({
          id: t.id,
          title: t.title,
          stimulusText: t.stimulusText,
          order: t.order,
        }));
        setAllTopics(topicsList);

        // Load messages if we have a current topic
        let messages: Message[] = [];
        if (topic && topic.id) {
          try {
            const messagesResponse = await chatApi.getHistory(Number(topic.id));
            messages = messagesResponse.data.messages.map((m) => ({
              id: m.id,
              content: m.content,
              role: m.role,
              timestamp: new Date(m.timestamp),
            }));
          } catch (error) {
            if (import.meta.env.DEV) {
          console.error('Failed to load messages:', error);
        }
          }
        }

        setAppState({
          currentView: user.hasCompletedLiteracySurvey ? 'chat' : 'literacy-survey',
          user: {
            id: user.id,
            email: user.email,
            assignedAgentId: user.assignedAgentId,
            currentTopicIndex: user.currentTopicIndex,
            hasCompletedLiteracySurvey: user.hasCompletedLiteracySurvey,
          },
          currentTopicIndex: user.currentTopicIndex || 0,
          currentAgent: agentData,
          interactionCount: interactionStatus?.interactionCount || 0,
          messages,
          showPostTopicSurvey: interactionStatus?.isLocked && !interactionStatus?.surveyCompleted,
        });
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Failed to load user state:', error);
        }
        // If token is invalid, clear it and redirect to auth
        removeToken();
        if (error.message?.includes('Session expired') || error.message?.includes('Invalid')) {
          setAppState({
            currentView: 'auth',
            user: null,
            currentTopicIndex: 0,
            currentAgent: null,
            interactionCount: 0,
            messages: [],
            showPostTopicSurvey: false,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserState();
  }, []);

  // Auth handlers
  const handleAuth = async (email: string, password: string, isLogin: boolean) => {
    try {
      setIsLoading(true);

      let response;
      
      if (isLogin) {
        response = await authApi.login(email, password);
      } else {
        response = await authApi.register(email, password);
      }

      const { user, agent, token } = response;

      // Convert agent
      const agentData: Agent = {
        id: agent.id,
        name: agent.name,
        emotionalIntelligence: agent.emotionalIntelligence,
        cognitiveIntelligence: agent.cognitiveIntelligence,
      };

      // Load topics
      const topicsResponse = await topicApi.getAll();
      const topicsList = topicsResponse.data.topics.map((t) => ({
        id: t.id,
        title: t.title,
        stimulusText: t.stimulusText,
        order: t.order,
      }));
      setAllTopics(topicsList);

      // Get current topic
      let topicData: Topic | null = null;
      if (user.currentTopicIndex !== undefined) {
        const currentTopicResponse = await topicApi.getCurrent();
        const topic = currentTopicResponse.data.topic;
        topicData = {
          id: topic.id,
          title: topic.title,
          stimulusText: topic.stimulusText,
          order: topic.order,
        };
        setCurrentTopic(topicData);
      }

      // Skip agent introduction - go directly to survey or chat
      setAppState({
        currentView: user.hasCompletedLiteracySurvey ? 'chat' : 'literacy-survey',
        user: {
          id: user.id,
          email: user.email,
          assignedAgentId: user.assignedAgentId,
          currentTopicIndex: user.currentTopicIndex,
          hasCompletedLiteracySurvey: user.hasCompletedLiteracySurvey,
        },
        currentTopicIndex: user.currentTopicIndex || 0,
        currentAgent: agentData,
        interactionCount: 0,
        messages: [],
        showPostTopicSurvey: false,
      });

      // Don't show toast with agent name - removed for research purposes
      // Users should not see which agent they're assigned to
    } catch (error: any) {
      let errorTitle = 'Authentication failed';
      let errorDescription = error.message || 'Please check your credentials and try again.';

      // Distinguish between connection errors and authentication errors
      if (error.message?.includes('Unable to connect') || 
          error.message?.includes('Backend service') || 
          error.message?.includes('temporarily unavailable') ||
          error.message?.includes('starting up') ||
          error.message?.includes('timed out')) {
        errorTitle = 'Service temporarily unavailable';
        errorDescription = error.message || 'The backend service may be starting up. Please wait a moment and try again.';
      } else if (error.message?.includes('Too many')) {
        errorTitle = 'Too many attempts';
        errorDescription = 'Please wait a few minutes before trying again.';
      } else if (error.message?.includes('already exists')) {
        errorTitle = 'Email already registered';
        errorDescription = 'This email is already in use. Please login or use a different email.';
      } else if (error.message?.includes('Invalid email')) {
        errorTitle = 'Invalid email format';
        errorDescription = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorTitle = 'Password requirement not met';
        errorDescription = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('Invalid credentials') || 
                 error.message?.includes('incorrect') ||
                 error.message?.includes('not found')) {
        errorTitle = 'Authentication failed';
        errorDescription = 'Invalid email or password. Please check your credentials and try again.';
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setAppState({
      currentView: 'auth',
      user: null,
      currentTopicIndex: 0,
      currentAgent: null,
      interactionCount: 0,
      messages: [],
      showPostTopicSurvey: false,
    });
    setCurrentTopic(null);
    setAllTopics([]);
  };

  // Survey handlers
  const handleLiteracySurveySubmit = async (responses: SurveyResponse[]) => {
    try {
      setIsLoading(true);
      await surveyApi.submitLiteracy(responses);
      
      setAppState((prev) => ({
        ...prev,
        currentView: 'chat',
        user: prev.user ? { ...prev.user, hasCompletedLiteracySurvey: true } : null,
      }));

      // Load current topic and messages
      await loadCurrentTopicAndMessages();
    } catch (error: any) {
      let errorTitle = 'Failed to submit survey';
      let errorDescription = error.message || 'Please try again.';

      if (error.message?.includes('exactly')) {
        errorTitle = 'Incomplete survey';
        errorDescription = 'Please answer all questions before submitting.';
      } else if (error.message?.includes('already completed')) {
        errorTitle = 'Survey already submitted';
        errorDescription = 'This survey has already been completed.';
      } else if (error.message?.includes('not required yet')) {
        errorTitle = 'Survey not available';
        errorDescription = 'Please complete 10 interactions first.';
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostTopicSurveySubmit = async (responses: SurveyResponse[]) => {
    try {
      setIsLoading(true);
      if (!currentTopic) return;

      const response = await surveyApi.submitPostTopic(Number(currentTopic.id), responses);
      
      // Load updated state
      const stateResponse = await userApi.getState();
      const { user, agent, currentTopic: topic, progress: progressData } = stateResponse.data;
      
      // Update progress
      if (progressData) {
        setProgress(progressData);
      }

      const agentData: Agent = {
        id: agent.id,
        name: agent.name,
        emotionalIntelligence: agent.emotionalIntelligence,
        cognitiveIntelligence: agent.cognitiveIntelligence,
      };

      let topicData: Topic | null = null;
      if (topic) {
        topicData = {
          id: topic.id,
          title: topic.title,
          stimulusText: topic.stimulusText,
          order: topic.order,
        };
        setCurrentTopic(topicData);
      }

      setAppState((prev) => ({
        ...prev,
        currentTopicIndex: user.currentTopicIndex || 0,
        currentAgent: agentData,
        interactionCount: 0,
        messages: [],
        showPostTopicSurvey: false,
      }));

      toast({
        title: 'Survey submitted',
        description: 'Moving to next topic...',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to submit survey',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load current topic and messages
  const loadCurrentTopicAndMessages = async () => {
    try {
      const topicResponse = await topicApi.getCurrent();
      const topic = topicResponse.data.topic;
      const topicData: Topic = {
        id: topic.id,
        title: topic.title,
        stimulusText: topic.stimulusText,
        order: topic.order,
      };
      setCurrentTopic(topicData);

      const messagesResponse = await chatApi.getHistory(Number(topic.id));
      const messages: Message[] = messagesResponse.data.messages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        timestamp: new Date(m.timestamp),
      }));

      // If no messages exist, automatically send the stimulus as the first message
      if (messages.length === 0 && topic.stimulusText && topic.stimulusText.trim().length > 0) {
        // Automatically send stimulus as first message
        try {
          const response = await chatApi.sendMessage(Number(topic.id), topic.stimulusText.trim());
          
          const userMessage: Message = {
            id: response.data.userMessage.id,
            content: response.data.userMessage.content,
            role: response.data.userMessage.role,
            timestamp: new Date(response.data.userMessage.timestamp),
          };

          const agentMessage: Message = {
            id: response.data.agentMessage.id,
            content: response.data.agentMessage.content,
            role: response.data.agentMessage.role,
            timestamp: new Date(response.data.agentMessage.timestamp),
          };

          setAppState((prev) => ({
            ...prev,
            messages: [userMessage, agentMessage],
            interactionCount: response.data.interactionCount,
            showPostTopicSurvey: response.data.shouldShowSurvey,
          }));
        } catch (error) {
          console.error('Failed to send initial stimulus message:', error);
          // If stimulus send fails, still set empty messages
          setAppState((prev) => ({
            ...prev,
            messages: [],
            interactionCount: topicResponse.data.interactionCount,
            showPostTopicSurvey: topicResponse.data.isLocked && !topicResponse.data.surveyCompleted,
          }));
        }
      } else {
        // Messages exist, just load them
        setAppState((prev) => ({
          ...prev,
          messages,
          interactionCount: topicResponse.data.interactionCount,
          showPostTopicSurvey: topicResponse.data.isLocked && !topicResponse.data.surveyCompleted,
        }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to load topic and messages:', error);
      }
    }
  };

  // Chat handlers
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentTopic) return;

    try {
      setIsAgentTyping(true);
      
      // Add user message immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date(),
      };

      setAppState((prev) => ({
        ...prev,
        messages: [...prev.messages, tempUserMessage],
      }));

      const response = await chatApi.sendMessage(Number(currentTopic.id), content.trim());
      
      const userMessage: Message = {
        id: response.data.userMessage.id,
        content: response.data.userMessage.content,
        role: response.data.userMessage.role,
        timestamp: new Date(response.data.userMessage.timestamp),
      };

      const agentMessage: Message = {
        id: response.data.agentMessage.id,
        content: response.data.agentMessage.content,
        role: response.data.agentMessage.role,
        timestamp: new Date(response.data.agentMessage.timestamp),
      };

      // Replace temp message with real one and add agent message
      setAppState((prev) => ({
        ...prev,
        messages: [...prev.messages.filter(m => m.id !== tempUserMessage.id), userMessage, agentMessage],
        interactionCount: response.data.interactionCount,
        showPostTopicSurvey: response.data.shouldShowSurvey,
      }));
    } catch (error: any) {
      // Remove temp message on error
      setAppState((prev) => ({
        ...prev,
        messages: prev.messages.filter(m => !m.id.startsWith('temp-')),
      }));
      
      // Better error messages for chat errors
      let errorTitle = 'Failed to send message';
      let errorDescription = error.message || 'Please try again';
      
      if (error.message?.includes('Topic is locked')) {
        errorTitle = 'Topic locked';
        errorDescription = 'Please complete the survey to continue chatting.';
      } else if (error.message?.includes('Topic not found')) {
        errorTitle = 'Topic not found';
        errorDescription = 'The selected topic could not be found. Please refresh the page.';
      } else if (error.message?.includes('OpenAI') || error.message?.includes('API')) {
        errorTitle = 'Service temporarily unavailable';
        errorDescription = 'The AI service is having issues. Please try again in a moment.';
      } else if (error.message?.includes('Server error') || error.message?.includes('500')) {
        errorTitle = 'Server error';
        errorDescription = 'The server encountered an error. Please try again in a moment.';
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
      
      // Log error for debugging (only in development)
      if (import.meta.env.DEV) {
        console.error('Chat send message error:', error);
      }
    } finally {
      setIsAgentTyping(false);
    }
  }, [currentTopic, toast]);

  const handleFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setAppState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      ),
    }));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render based on current view
  if (appState.currentView === 'auth') {
    // Agent introduction removed - skip directly to survey or chat
    if (showForgotPassword) {
      return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
    }
    return (
      <AuthForm
        onSubmit={(email, password, isLogin) => handleAuth(email, password, isLogin)}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  if (appState.currentView === 'literacy-survey') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SurveyModal
          title="AI Literacy Assessment"
          description="Before you begin, please complete this brief survey about your experience with AI systems."
          questions={aiLiteracySurveyQuestions}
          onSubmit={handleLiteracySurveySubmit}
        />
      </div>
    );
  }

  // Check if all topics completed
  if (appState.currentTopicIndex >= allTopics.length || progress.completedTopics >= progress.totalTopics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-2xl animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-6">
            <GraduationCap className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Study Complete!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for participating in this research study. Your contributions help us understand how different agent personalities affect customer service experiences.
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary mb-1">{progress.completedTopics}</div>
              <div className="text-sm text-muted-foreground">Topics Completed</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary mb-1">{progress.totalInteractions}</div>
              <div className="text-sm text-muted-foreground">Total Interactions</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary mb-1">{progress.totalTopics}</div>
              <div className="text-sm text-muted-foreground">Total Topics</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary mb-1">{progress.completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You've successfully completed all conversation topics with {appState.currentAgent?.name || 'your assigned agent'}.
              All your interactions and survey responses have been recorded for research analysis.
            </p>
            <Button onClick={handleLogout} size="lg">
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main chat view
  if (!currentTopic || !appState.currentAgent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading topic...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top navigation bar */}
      <header className="border-b bg-card">
        <div className="h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Research Platform</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTopicList(true)}
              className="ml-4"
            >
              View All Topics
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {/* Agent EQ/IQ Info */}
            {appState.currentAgent && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-lg">
                <div className="text-xs">
                  <span className="font-medium text-foreground">{appState.currentAgent.name}</span>
                </div>
              </div>
            )}
            {/* Progress percentage badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
              <span className="text-sm font-semibold text-primary">
                {progress.completionPercentage}%
              </span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {appState.user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-12 px-6 border-t bg-muted/30 flex items-center">
          <ProgressBar
            completedTopics={progress.completedTopics}
            totalTopics={progress.totalTopics}
            completionPercentage={progress.completionPercentage}
          />
        </div>
      </header>

      {/* Chat window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          topic={currentTopic}
          agent={appState.currentAgent}
          messages={appState.messages}
          interactionCount={appState.interactionCount}
          maxInteractions={MAX_INTERACTIONS}
          topicNumber={appState.currentTopicIndex + 1}
          totalTopics={allTopics.length}
          onSendMessage={handleSendMessage}
          onFeedback={handleFeedback}
          onShowPolicy={() => setShowPolicyPanel(true)}
          isAgentTyping={isAgentTyping}
        />
      </div>

      {/* Policy panel */}
      {showPolicyPanel && currentTopic && (
        <PolicyPanel
          topic={currentTopic}
          guardrails={globalGuardrails}
          onClose={() => setShowPolicyPanel(false)}
        />
      )}

      {/* Post-topic survey modal */}
      {appState.showPostTopicSurvey && currentTopic && appState.currentAgent && (
        <SurveyModal
          title="Topic Evaluation"
          description={`Please rate your experience with ${appState.currentAgent.name} on the topic "${currentTopic.title}".`}
          questions={postTopicSurveyQuestions}
          onSubmit={handlePostTopicSurveySubmit}
        />
      )}

      {/* Topic list modal */}
      {showTopicList && (
        <TopicListModal
          currentTopicIndex={appState.currentTopicIndex}
          onClose={() => setShowTopicList(false)}
        />
      )}
    </div>
  );
}
