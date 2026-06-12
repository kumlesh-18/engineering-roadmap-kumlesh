'use client';

import * as React from 'react';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatTime } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Clock, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface QuizPlayerProps {
  nodeId: string;
  roadmapId: string;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'code_completion';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: string;
  tags: string[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  results: Record<string, { correct: boolean; expected: string | string[]; given: string | string[] }>;
}

export function QuizPlayer({ nodeId, roadmapId }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = trpc.quiz.generate.useMutation({
    onSuccess: (data) => {
      setQuestions(data.questions);
      setGenerated(true);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate quiz');
      setIsGenerating(false);
    },
  });

  const submitQuiz = trpc.quiz.submit.useMutation({
    onSuccess: (data) => {
      setQuizResult({ score: data.score, passed: data.passed, results: data.results });
      setShowResults(true);
      toast.success(data.passed ? 'Quiz passed!' : `Quiz failed. Score: ${data.score}%`);
    },
    onError: () => toast.error('Failed to submit quiz'),
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateQuiz.mutate({ nodeId, count: 5 });
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    submitQuiz.mutate({ nodeId, answers, timeSeconds: timeElapsed });
  };

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setQuizResult(null);
    setCurrentQuestion(0);
    setTimeElapsed(0);
  };

  const handleRegenerate = () => {
    setGenerated(false);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);
    setQuizResult(null);
    setCurrentQuestion(0);
    setTimeElapsed(0);
  };

  React.useEffect(() => {
    if (!showResults && generated) {
      const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, generated]);

  if (!generated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No quiz available yet</h3>
          <p className="text-muted-foreground mb-6">Generate a quiz to test your knowledge on this topic</p>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full max-w-xs">
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults && quizResult) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className={cn('mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center', quizResult.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
            {quizResult.passed ? <Trophy className="h-8 w-8 text-green-500" /> : <AlertTriangle className="h-8 w-8 text-red-500" />}
          </div>
          <CardTitle>{quizResult.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}</CardTitle>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className={cn('text-3xl font-bold', quizResult.passed ? 'text-green-500' : 'text-red-500')}>{quizResult.score}%</div>
            <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{formatTime(timeElapsed)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((q, i) => {
              const result = quizResult.results[q.id];
              const isCorrect = result?.correct;
              return (
                <div key={q.id} className={cn('p-4 rounded-lg border', isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20')}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Question {i + 1}</span>
                    <span className={cn('flex items-center gap-1 text-sm font-medium', isCorrect ? 'text-green-500' : 'text-red-500')}>
                      {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="font-medium mb-3">{q.question}</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Your answer:</strong> {Array.isArray(result?.given) ? result.given.join(', ') : result?.given ?? 'No answer'}</p>
                    {!isCorrect && <p><strong>Correct answer:</strong> {Array.isArray(result?.expected) ? result.expected.join(', ') : result?.expected}</p>}
                    <p className="text-muted-foreground"><strong>Explanation:</strong> {q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={handleRetry} className="flex-1">Try Again</Button>
            <Button variant="outline" onClick={handleRegenerate} className="flex-1">New Quiz</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const answer = answers[question.id];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{formatTime(timeElapsed)}</div>
        </div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">{question.type.replace('_', ' ')}</span>
              <p className="text-lg font-medium">{question.question}</p>
            </div>

            {question.type === 'multiple_choice' && question.options && (
              <RadioGroup
                value={answer as string}
                onValueChange={v => handleAnswerChange(question.id, v)}
                className="space-y-3"
              >
                {question.options.map((option, i) => (
                  <div key={i} className="relative">
                    <RadioGroupItem value={option} id={`${question.id}-${i}`} className="peer" />
                    <Label htmlFor={`${question.id}-${i}`} className={cn(
                      'w-full p-4 rounded-lg border cursor-pointer transition-all',
                      'hover:bg-muted',
                      'peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary'
                    )}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                        <span>{option}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'true_false' && (
              <RadioGroup
                value={answer as string}
                onValueChange={v => handleAnswerChange(question.id, v)}
                className="grid grid-cols-2 gap-3"
              >
                {['True', 'False'].map((option) => (
                  <div key={option}>
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} className="peer" />
                    <Label htmlFor={`${question.id}-${option}`} className={cn(
                      'w-full p-4 rounded-lg border cursor-pointer transition-all text-center',
                      'hover:bg-muted',
                      'peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary'
                    )}>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'short_answer' && (
              <div className="space-y-2">
                <Label htmlFor={`short-${question.id}`}>Your answer</Label>
                <textarea
                  id={`short-${question.id}`}
                  value={(answer as string) ?? ''}
                  onChange={e => handleAnswerChange(question.id, e.target.value)}
                  className="w-full min-h-[100px] p-4 rounded-lg border bg-background focus:ring-2 focus:ring-ring"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {question.type === 'code_completion' && (
              <div className="space-y-2">
                <Label>Complete the code</Label>
                <textarea
                  value={(answer as string) ?? ''}
                  onChange={e => handleAnswerChange(question.id, e.target.value)}
                  className="w-full min-h-[150px] p-4 rounded-lg border bg-background focus:ring-2 focus:ring-ring font-mono text-sm"
                  placeholder="// Write your code here..."
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0}>
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </div>
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1))}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}