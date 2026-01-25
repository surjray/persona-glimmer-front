import { useRef, useEffect } from 'react';
import { Message, Topic, Agent } from '@/types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TopicHeader } from './TopicHeader';
import { TypingIndicator } from './TypingIndicator';
import { MessageSquareText } from 'lucide-react';

interface ChatWindowProps {
  topic: Topic;
  agent: Agent;
  messages: Message[];
  interactionCount: number;
  maxInteractions: number;
  topicNumber: number;
  totalTopics: number;
  onSendMessage: (content: string) => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onShowPolicy: () => void;
  isAgentTyping?: boolean;
}

export function ChatWindow({
  topic,
  agent,
  messages,
  interactionCount,
  maxInteractions,
  topicNumber,
  totalTopics,
  onSendMessage,
  onFeedback,
  onShowPolicy,
  isAgentTyping = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <TopicHeader
        topic={topic}
        agent={agent}
        interactionCount={interactionCount}
        maxInteractions={maxInteractions}
        topicNumber={topicNumber}
        totalTopics={totalTopics}
        onShowPolicy={onShowPolicy}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <MessageSquareText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Start the Conversation</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Begin discussing "{topic.title}" with {agent.name}. You have {maxInteractions} interactions to complete this topic.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onFeedback={message.role === 'agent' ? onFeedback : undefined}
                agentName={agent.name}
              />
            ))}
            {isAgentTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={onSendMessage}
        disabled={interactionCount >= maxInteractions}
        placeholder={
          interactionCount >= maxInteractions
            ? 'Topic complete - please complete the survey'
            : `Message ${agent.name}...`
        }
      />
    </div>
  );
}
