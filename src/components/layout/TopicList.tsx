import { Topic } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TopicWithStatus extends Topic {
  status: 'completed' | 'current' | 'locked' | 'accessible';
  interactionCount: number;
}

interface TopicListProps {
  topics: TopicWithStatus[];
  currentTopicIndex: number;
  onClose: () => void;
  onTopicSelect?: (topicId: number) => void;
}

export function TopicList({ topics, currentTopicIndex, onClose, onTopicSelect }: TopicListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'current':
        return <Play className="w-5 h-5 text-primary" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'Current';
      case 'locked':
        return 'Locked';
      default:
        return 'Available';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col shadow-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">All Topics</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => {
              const isCurrent = topic.order === currentTopicIndex + 1;
              const isClickable = topic.status === 'current' || topic.status === 'accessible';

              return (
                <div
                  key={topic.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : topic.status === 'completed'
                      ? 'border-accent/50 bg-accent/5'
                      : topic.status === 'locked'
                      ? 'border-muted bg-muted/30 opacity-60'
                      : 'border-border bg-card hover:border-primary/50',
                    isClickable && 'cursor-pointer hover:shadow-md'
                  )}
                  onClick={() => {
                    if (isClickable && onTopicSelect) {
                      onTopicSelect(Number(topic.id));
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Topic {topic.order}
                        </span>
                        {getStatusIcon(topic.status)}
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            topic.status === 'completed'
                              ? 'bg-accent/20 text-accent'
                              : topic.status === 'current'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {getStatusLabel(topic.status)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {topic.stimulusText}
                      </p>
                      {topic.status !== 'locked' && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Interactions: {topic.interactionCount}/10
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
