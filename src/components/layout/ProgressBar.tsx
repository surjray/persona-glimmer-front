import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  completedTopics: number;
  totalTopics: number;
  completionPercentage: number;
}

export function ProgressBar({ completedTopics, totalTopics, completionPercentage }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[120px]">
        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {completedTopics} of {totalTopics} topics
        </span>
      </div>
      <div className="flex-1 min-w-[100px] max-w-[200px]">
        <Progress value={completionPercentage} className="h-2" />
      </div>
      <span className="text-sm text-muted-foreground min-w-[40px] text-right">
        {completionPercentage}%
      </span>
    </div>
  );
}
