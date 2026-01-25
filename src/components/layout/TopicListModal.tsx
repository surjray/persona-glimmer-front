import { useState, useEffect } from 'react';
import { TopicList } from './TopicList';
import { topicApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TopicListModalProps {
  currentTopicIndex: number;
  onClose: () => void;
}

export function TopicListModal({ currentTopicIndex, onClose }: TopicListModalProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await topicApi.getWithStatus();
        setTopics(response.data.topics);
      } catch (error) {
        console.error('Failed to load topics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card rounded-lg p-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <TopicList
      topics={topics}
      currentTopicIndex={currentTopicIndex}
      onClose={onClose}
    />
  );
}
