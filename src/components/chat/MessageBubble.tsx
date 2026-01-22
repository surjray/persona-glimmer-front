import { Message } from '@/types';
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  agentName?: string;
}

export function MessageBubble({ message, onFeedback, agentName = 'Agent' }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse animate-slide-in-right' : 'mr-auto animate-slide-in-left'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary' : 'bg-secondary'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>

      <div className="space-y-1">
        {/* Sender name */}
        <p className={cn('text-xs text-muted-foreground', isUser && 'text-right')}>
          {isUser ? 'You' : agentName}
        </p>

        {/* Message bubble */}
        <div className={cn(isUser ? 'chat-bubble-user' : 'chat-bubble-agent')}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Feedback buttons for agent messages */}
        {!isUser && onFeedback && (
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => onFeedback(message.id, 'positive')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                message.feedback === 'positive'
                  ? 'bg-accent/20 text-accent'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
              aria-label="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFeedback(message.id, 'negative')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                message.feedback === 'negative'
                  ? 'bg-destructive/20 text-destructive'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
              aria-label="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
