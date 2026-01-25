import { Message } from '@/types';
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);

  // Less than 1 minute ago
  if (diffInSeconds < 60) {
    return 'just now';
  }

  // Less than 1 hour ago
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Less than 24 hours ago
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Same day
  if (messageTime.toDateString() === now.toDateString()) {
    return messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // Different day - show date and time
  return messageTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

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
        {/* Sender name and timestamp */}
        <div className={cn('flex items-center gap-2', isUser && 'flex-row-reverse')}>
          <p className={cn('text-xs text-muted-foreground')}>
            {isUser ? 'You' : agentName}
          </p>
          <span className={cn('text-xs text-muted-foreground/70')}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

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
