import { Agent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Brain, Heart, ArrowRight, Sparkles } from 'lucide-react';

interface AgentIntroductionProps {
  agent: Agent;
  onContinue: () => void;
}

export function AgentIntroduction({ agent, onContinue }: AgentIntroductionProps) {
  const emotionalLevel = agent.emotionalIntelligence || 0;
  const cognitiveLevel = agent.cognitiveIntelligence || 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <Card className="shadow-card">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to the Research Platform!</CardTitle>
            <CardDescription className="text-base">
              You've been assigned to work with a unique customer service agent throughout your journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Agent Info */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">Your assigned agent</p>
                </div>
              </div>

              {/* Intelligence Levels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Emotional Intelligence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{ width: `${(emotionalLevel / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{emotionalLevel}/10</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Cognitive Intelligence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(cognitiveLevel / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{cognitiveLevel}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>
                  <strong className="text-foreground">Consistent Agent:</strong> You'll work with{' '}
                  <strong className="text-foreground">{agent.name}</strong> across all 20 conversation topics.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>
                  <strong className="text-foreground">Your Agent's Style:</strong> This agent has a unique combination
                  of emotional and cognitive intelligence that will influence how they respond to your inquiries.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>
                  <strong className="text-foreground">Research Purpose:</strong> This is a research study. Your
                  interactions help us understand how different agent personalities affect customer service experiences.
                </p>
              </div>
            </div>

            <Button onClick={onContinue} className="w-full group" size="lg">
              Continue to AI Literacy Survey
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
