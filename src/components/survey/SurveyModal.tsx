import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LikertScale } from './LikertScale';
import { SurveyQuestion, SurveyResponse } from '@/types';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SurveyModalProps {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  onSubmit: (responses: SurveyResponse[]) => void;
  onClose?: () => void;
}

export function SurveyModal({ title, description, questions, onSubmit, onClose }: SurveyModalProps) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  
  const questionsPerPage = 4;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / questions.length) * 100;
  const isComplete = answeredCount === questions.length;
  const isLastPage = currentPage === totalPages - 1;

  const handleResponse = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    
    const surveyResponses: SurveyResponse[] = Object.entries(responses).map(
      ([questionId, value]) => ({ questionId, value })
    );
    onSubmit(surveyResponses);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-modal animate-fade-in">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-primary">
                Question {Math.min(answeredCount + 1, questions.length)} of {questions.length}
              </span>
              <p className="text-xs text-muted-foreground">
                {answeredCount} / {questions.length} answered
              </p>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin">
          <div className="space-y-8">
            {currentQuestions.map((question, index) => {
              const globalIndex = currentPage * questionsPerPage + index + 1;
              return (
                <div key={question.id} className="space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium border-2 border-primary/20">
                      {globalIndex}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {question.category && (
                          <span className="text-xs font-medium text-primary uppercase tracking-wide">
                            {question.category}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Question {globalIndex} of {questions.length}
                        </span>
                      </div>
                      <p className="text-foreground mt-1">{question.text}</p>
                    </div>
                    {responses[question.id] && (
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    )}
                  </div>
                  <div className="pl-10">
                    <LikertScale
                      value={responses[question.id] || null}
                      onChange={(value) => handleResponse(question.id, value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        <div className="border-t p-4 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isLastPage ? (
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!isComplete}
                className="min-w-[100px]"
              >
                {isComplete ? 'Submit' : `${questions.length - answeredCount} left`}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
