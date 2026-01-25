import { Topic, Agent } from '@/types';
import { MessageSquare, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopicHeaderProps {
  topic: Topic;
  agent: Agent;
  interactionCount: number;
  maxInteractions: number;
  topicNumber: number;
  totalTopics: number;
  onShowPolicy: () => void;
}

export function TopicHeader({
  topic,
  agent,
  interactionCount,
  maxInteractions,
  topicNumber,
  totalTopics,
  onShowPolicy,
}: TopicHeaderProps) {
  const progress = (interactionCount / maxInteractions) * 100;

  return (
    <div className="border-b bg-card px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        {/* Topic info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Topic {topicNumber} of {totalTopics}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-foreground truncate">{topic.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{topic.stimulusText || topic.description}</p>
        </div>

        {/* Agent info and actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{agent.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {agent.description || 
                (agent.emotionalIntelligence !== undefined && agent.cognitiveIntelligence !== undefined
                  ? `EQ: ${agent.emotionalIntelligence}/10, IQ: ${agent.cognitiveIntelligence}/10`
                  : 'Customer Service Agent')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onShowPolicy}>
            <Info className="w-4 h-4 mr-1" />
            Policy
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-sm">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Interactions:</span>
            <span className="font-medium">
              {interactionCount} / {maxInteractions}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {maxInteractions - interactionCount} remaining
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
