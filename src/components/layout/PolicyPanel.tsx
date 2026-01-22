import { Topic, Guardrails } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, FileText, Shield, BookOpen } from 'lucide-react';

interface PolicyPanelProps {
  topic: Topic;
  guardrails: Guardrails;
  onClose: () => void;
}

export function PolicyPanel({ topic, guardrails, onClose }: PolicyPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg policy-panel shadow-modal animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">Policies & Guidelines</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Topic Policy */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Topic Policy</h3>
                </div>
                <div className="bg-card rounded-lg border p-4">
                  <h4 className="font-medium text-sm text-primary mb-2">{topic.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {topic.policyText}
                  </p>
                </div>
              </section>

              {/* Global Guardrails */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-accent" />
                  <h3 className="font-medium">{guardrails.title}</h3>
                </div>
                <div className="bg-card rounded-lg border p-4">
                  <div className="prose prose-sm max-w-none">
                    {guardrails.content.split('\n\n').map((section, index) => {
                      const lines = section.split('\n');
                      const isHeader = lines[0].startsWith('##');
                      
                      if (isHeader) {
                        const headerText = lines[0].replace('## ', '');
                        const content = lines.slice(1);
                        return (
                          <div key={index} className="mb-4 last:mb-0">
                            <h5 className="font-medium text-sm text-foreground mb-2">
                              {headerText}
                            </h5>
                            <ul className="space-y-1">
                              {content.map((line, lineIndex) => (
                                <li key={lineIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1.5">•</span>
                                  <span>{line.replace('- ', '')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      
                      return (
                        <p key={index} className="text-sm text-muted-foreground">
                          {section}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Scenario context */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">Scenario Context</h3>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    You are interacting with a customer service agent regarding: <span className="font-medium text-foreground">{topic.description}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The agent should follow the topic policy guidelines while maintaining adherence to global service guardrails.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
