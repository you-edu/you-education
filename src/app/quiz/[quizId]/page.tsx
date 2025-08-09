'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Quiz, QuizAnswer } from '@/lib/types';
import { toast } from 'sonner';
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Info } from 'lucide-react';

const QuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showChaptersInfo, setShowChaptersInfo] = useState<boolean>(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const userResponse = await axios.get(`/api/users/by-email?email=${session.user.email}`);
          setUserId(userResponse.data._id);
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      }
    };

    fetchUserData();
  }, [session]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(`/api/quiz/${quizId}?userId=${userId}`);
        setQuiz(response.data);
        setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
        
        // Initialize answers array
        const initialAnswers: QuizAnswer[] = response.data.questions.map((_: any, index: number) => ({
          questionIndex: index,
          selectedOption: -1,
          isCorrect: false,
          timeTaken: 0
        }));
        setAnswers(initialAnswers);
      } catch (error: any) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [userId, quizId, router]);

  // Timer logic
  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const startQuiz = () => {
    setIsStarted(true);
    setStartedAt(new Date());
    setQuestionStartTime(Date.now());
    toast.success('Quiz started! Good luck!');
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      toast.error('Please select an answer before proceeding');
      return;
    }

    // Calculate time taken for this question
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Update answers
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = {
      questionIndex: currentQuestion,
      selectedOption,
      isCorrect: false, // This will be calculated on the server
      timeTaken
    };
    setAnswers(updatedAnswers);

    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz(updatedAnswers);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(answers[currentQuestion - 1]?.selectedOption ?? null);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmitQuiz = async (finalAnswers?: QuizAnswer[]) => {
    if (!userId || !startedAt) return;

    setIsSubmitting(true);
    
    try {
      const answersToSubmit = finalAnswers || answers;
      
      const response = await axios.post('/api/quiz/attempt', {
        quizId,
        userId,
        answers: answersToSubmit,
        startedAt: startedAt.toISOString()
      });

      if (response.data.success) {
        toast.success('Quiz submitted successfully!');
        router.push(`/quiz/results/${response.data.attempt._id}`);
      } else {
        toast.error('Failed to submit quiz');
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / (quiz?.questions.length || 1)) * 100;
  };

  // Helpers to format difficulty and parse chapters from existing title
  const formatDifficulty = (diff?: string) =>
    diff ? diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase() : 'Medium';

  const extractChaptersFromTitle = (title: string): string[] => {
    const start = title.lastIndexOf('(');
    const end = title.lastIndexOf(')');
    if (start !== -1 && end !== -1 && end > start) {
      const inner = title.slice(start + 1, end);
      return inner.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !userId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Quiz not found or access denied</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    const examName =
      quiz?.examId && typeof quiz.examId === 'object' && quiz.examId !== null && 'subjectName' in quiz.examId
        ? (quiz.examId as any).subjectName
        : 'Exam';
    const shortName = `${examName}`;
    const chaptersUsed = extractChaptersFromTitle(quiz?.title || '');

    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-12 bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight">{shortName}</h1>
              <button
                type="button"
                onClick={() => setShowChaptersInfo(v => !v)}
                className="inline-flex items-center justify-center rounded p-1 hover:bg-gray-100 dark:hover:bg-black/70"
                title="Show chapters used"
                aria-label="Show chapters used"
              >
                <Info className="h-5 w-5 text-gray-600 dark:text-white/70" />
              </button>
            </div>
            {showChaptersInfo && (
              <p className="text-gray-600 dark:text-white/70 mb-4 text-sm">
                Chapters: {chaptersUsed.length ? chaptersUsed.join(', ') : 'Unavailable'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-white/10">
              <CheckCircle className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold text-black dark:text-white mb-1">Questions</h3>
              <p className="text-gray-500 dark:text-white/70">{quiz.totalQuestions}</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-white/10">
              <Clock className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-black dark:text-white mb-1">Time Limit</h3>
              <p className="text-gray-500 dark:text-white/70">{quiz.timeLimit} minutes</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-white/10">
              <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
              <h3 className="font-bold text-black dark:text-white mb-1">Difficulty</h3>
              <p className="text-gray-500 dark:text-white/70 capitalize">{quiz.difficulty}</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-12">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">Instructions:</h3>
            <ul className="text-yellow-700 dark:text-yellow-300 space-y-2">
              <li>• Read each question carefully before selecting an answer</li>
              <li>• You can navigate between questions using the navigation buttons</li>
              <li>• Make sure to submit your quiz before the time runs out</li>
              <li>• Once submitted, you cannot change your answers</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={startQuiz}
              className="px-12 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const examName =
    quiz?.examId && typeof quiz.examId === 'object' && quiz.examId !== null && 'subjectName' in quiz.examId
      ? (quiz.examId as any).subjectName
      : 'Exam';
  const shortName = `${examName} - ${formatDifficulty(quiz?.difficulty)}`;
  const chaptersUsed = extractChaptersFromTitle(quiz?.title || '');

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-black/90 shadow-lg shadow-gray-500 border-b border-gray-100 dark:border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-black dark:text-white">{shortName}</h1>
                <button
                  type="button"
                  onClick={() => setShowChaptersInfo(v => !v)}
                  className="inline-flex items-center justify-center rounded p-1 hover:bg-gray-100 dark:hover:bg-black/70"
                  title="Show chapters used"
                  aria-label="Show chapters used"
                >
                  <Info className="h-4 w-4 text-gray-600 dark:text-white/70" />
                </button>
              </div>
              {showChaptersInfo && (
                <p className="text-xs text-gray-600 dark:text-white/70 mt-1">
                  Chapters: {chaptersUsed.length ? chaptersUsed.join(', ') : 'Unavailable'}
                </p>
              )}
              <p className="text-gray-500 dark:text-white/70">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                timeLeft <= 300 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 w-full bg-gray-200 dark:bg-black/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-12">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-8">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedOption === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-black/50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 mr-6 flex items-center justify-center ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-white/30'
                    }`}>
                      {selectedOption === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-black dark:text-white text-lg">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                currentQuestion === 0
                  ? 'bg-gray-100 dark:bg-black/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-black/70 text-gray-700 dark:text-white/70 hover:bg-gray-300 dark:hover:bg-black/50 border border-gray-300 dark:border-white/20'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              Previous
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={selectedOption === null || isSubmitting}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                selectedOption === null || isSubmitting
                  ? 'bg-gray-100 dark:bg-black/50 text-gray-400 cursor-not-allowed'
                  : currentQuestion === quiz.questions.length - 1
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
              }`}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : currentQuestion === quiz.questions.length - 1 ? (
                'Submit Quiz'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
