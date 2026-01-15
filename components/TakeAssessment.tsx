import { useState, useEffect } from 'react';
import { getServerUrl } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ClipboardList, Clock, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  questions: Question[];
}

interface TakeAssessmentProps {
  session: any;
  userId: string;
}

export function TakeAssessment({ session, userId }: TakeAssessmentProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (activeAssessment && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleSubmit();
        return;
      }

      const timer = setInterval(() => {
        setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeAssessment, timeRemaining]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(getServerUrl('/assessments'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(assessment.duration * 60);
    setResult(null);
  };

  const handleAnswer = (questionIndex: number, answer: any) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    if (!activeAssessment) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(
        getServerUrl(`/assessments/${activeAssessment.id.replace('assessment:', '')}/submit`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setResult({ score: data.score, total: data.totalQuestions });
      toast.success('Pentaksiran berjaya dihantar!');
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast.error(error.message || 'Gagal menghantar pentaksiran');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-8">Memuatkan pentaksiran...</div>;
  }

  // Show result screen
  if (result && activeAssessment) {
    const percentage = Math.round((result.score / result.total) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Pentaksiran Selesai!</CardTitle>
            <CardDescription>Ini adalah keputusan anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-2">{percentage}%</div>
              <p className="text-gray-600">
                Anda menjawab {result.score} daripada {result.total} soalan dengan betul
              </p>
            </div>
            <Progress value={percentage} className="h-3" />
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => {
                setActiveAssessment(null);
                setResult(null);
              }}>
                Kembali ke Pentaksiran
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show active assessment
  if (activeAssessment) {
    const question = activeAssessment.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / activeAssessment.questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>{activeAssessment.title}</CardTitle>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            <Progress value={progress} className="h-2" />
            <CardDescription>
              Soalan {currentQuestion + 1} daripada {activeAssessment.questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg mb-4">{question.question}</h3>
              
              {question.type === 'multiple-choice' ? (
                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswer(currentQuestion, parseInt(value))}
                >
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  placeholder="Taip jawapan anda di sini..."
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              {currentQuestion > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Sebelum
                </Button>
              )}
              {currentQuestion < activeAssessment.questions.length - 1 ? (
                <Button
                  className="ml-auto"
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  Seterusnya
                </Button>
              ) : (
                <Button
                  className="ml-auto"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Menghantar...' : 'Hantar Pentaksiran'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show assessment list
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-gray-900">Amalan & Pentaksiran</h2>
        <p className="text-gray-600 mt-1">Uji pengetahuan anda dengan kuiz dan tugasan</p>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tiada pentaksiran tersedia lagi.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{assessment.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {assessment.description}
                </CardDescription>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {assessment.category}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {assessment.duration} minit
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {assessment.questions?.length || 0} soalan
                </p>
                <Button
                  className="w-full"
                  onClick={() => startAssessment(assessment)}
                >
                  Mula Pentaksiran
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}