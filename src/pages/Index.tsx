import { useState, useCallback } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { SurveyModal } from '@/components/survey/SurveyModal';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { PolicyPanel } from '@/components/layout/PolicyPanel';
import { Message, SurveyResponse, AppState } from '@/types';
import {
  agents,
  topics,
  aiLiteracySurveyQuestions,
  postTopicSurveyQuestions,
  globalGuardrails,
  mockAgentResponses,
} from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';

const MAX_INTERACTIONS = 10;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function Index() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'auth',
    user: null,
    currentTopicIndex: 0,
    currentAgent: agents[0],
    interactionCount: 0,
    messages: [],
    showPostTopicSurvey: false,
  });
  
  const [showPolicyPanel, setShowPolicyPanel] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const currentTopic = topics[appState.currentTopicIndex];
  const currentAgent = appState.currentAgent || agents[0];

  // Auth handlers
  const handleAuth = (email: string, _password: string) => {
    const isNew = !localStorage.getItem(`user-${email}`);
    setIsNewUser(isNew);
    
    if (isNew) {
      localStorage.setItem(`user-${email}`, 'registered');
    }
    
    setAppState((prev) => ({
      ...prev,
      currentView: isNew ? 'literacy-survey' : 'chat',
      user: {
        id: generateId(),
        email,
        hasCompletedLiteracySurvey: !isNew,
      },
    }));
  };

  const handleLogout = () => {
    setAppState({
      currentView: 'auth',
      user: null,
      currentTopicIndex: 0,
      currentAgent: agents[0],
      interactionCount: 0,
      messages: [],
      showPostTopicSurvey: false,
    });
  };

  // Survey handlers
  const handleLiteracySurveySubmit = (_responses: SurveyResponse[]) => {
    setAppState((prev) => ({
      ...prev,
      currentView: 'chat',
      user: prev.user ? { ...prev.user, hasCompletedLiteracySurvey: true } : null,
    }));
  };

  const handlePostTopicSurveySubmit = (_responses: SurveyResponse[]) => {
    // Move to next topic
    const nextTopicIndex = appState.currentTopicIndex + 1;
    const nextAgent = agents[nextTopicIndex % agents.length];
    
    setAppState((prev) => ({
      ...prev,
      currentTopicIndex: nextTopicIndex,
      currentAgent: nextAgent,
      interactionCount: 0,
      messages: [],
      showPostTopicSurvey: false,
    }));
  };

  // Chat handlers
  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // Simulate agent response
    const agentResponse: Message = {
      id: generateId(),
      content: mockAgentResponses[Math.floor(Math.random() * mockAgentResponses.length)],
      role: 'agent',
      timestamp: new Date(),
      feedback: null,
    };

    setAppState((prev) => {
      const newInteractionCount = prev.interactionCount + 1;
      const showSurvey = newInteractionCount >= MAX_INTERACTIONS;
      
      return {
        ...prev,
        messages: [...prev.messages, userMessage, agentResponse],
        interactionCount: newInteractionCount,
        showPostTopicSurvey: showSurvey,
      };
    });
  }, []);

  const handleFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setAppState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      ),
    }));
  }, []);

  // Render based on current view
  if (appState.currentView === 'auth') {
    return <AuthForm onSubmit={handleAuth} />;
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
  if (appState.currentTopicIndex >= topics.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6">
            <GraduationCap className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Study Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for participating in this research study. You have completed all {topics.length} conversation topics.
          </p>
          <Button onClick={handleLogout}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // Main chat view
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top navigation bar */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">Research Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {appState.user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Chat window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          topic={currentTopic}
          agent={currentAgent}
          messages={appState.messages}
          interactionCount={appState.interactionCount}
          maxInteractions={MAX_INTERACTIONS}
          topicNumber={appState.currentTopicIndex + 1}
          totalTopics={topics.length}
          onSendMessage={handleSendMessage}
          onFeedback={handleFeedback}
          onShowPolicy={() => setShowPolicyPanel(true)}
        />
      </div>

      {/* Policy panel */}
      {showPolicyPanel && (
        <PolicyPanel
          topic={currentTopic}
          guardrails={globalGuardrails}
          onClose={() => setShowPolicyPanel(false)}
        />
      )}

      {/* Post-topic survey modal */}
      {appState.showPostTopicSurvey && (
        <SurveyModal
          title="Topic Evaluation"
          description={`Please rate your experience with ${currentAgent.name} on the topic "${currentTopic.title}".`}
          questions={postTopicSurveyQuestions}
          onSubmit={handlePostTopicSurveySubmit}
        />
      )}
    </div>
  );
}
