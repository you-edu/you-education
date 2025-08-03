'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { QuizAttempt, Quiz } from '@/lib/types';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, Award, ArrowLeft, RotateCcw, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface QuizAttemptWithDetails extends QuizAttempt {
  quiz: Quiz;
}

const QuizResultsPage = () => {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const { data: session } = useSession();
  
  console.log('🔍 QuizResultsPage - Component initialized');
  console.log('📋 attemptId from params:', attemptId);
  console.log('👤 session:', session);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [attempt, setAttempt] = useState<QuizAttemptWithDetails | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    console.log('🚀 useEffect - fetchUserData triggered');
    const fetchUserData = async () => {
      if (session?.user?.email) {
        console.log('📧 Fetching user data for email:', session.user.email);
        try {
          const userResponse = await axios.get(`/api/users/by-email?email=${session.user.email}`);
          console.log('✅ User data fetched successfully:', userResponse.data);
          setUserId(userResponse.data._id);
          console.log('🆔 UserId set to:', userResponse.data._id);
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      } else {
        console.log('⚠️ No session email available');
      }
    };

    fetchUserData();
  }, [session]);

  // Fetch attempt data
  useEffect(() => {
    console.log('🚀 useEffect - fetchAttempt triggered');
    console.log('📊 Current userId:', userId);
    console.log('📝 Current attemptId:', attemptId);
    
    const fetchAttempt = async () => {
      if (!userId) {
        console.log('⚠️ No userId available, skipping fetch');
        return;
      }
      
      console.log('🔄 Starting to fetch attempt...');
      
      try {
        const url = `/api/quiz/attempt/${attemptId}?userId=${userId}`;
        console.log('🌐 Attempt fetch URL:', url);
        
        const response = await axios.get(url);
        console.log('📬 Attempt response:', response.data);
        console.log('🎯 Attempt data structure:', {
          _id: response.data._id,
          quiz: response.data.quiz,
          quizId: response.data.quizId,
          score: response.data.score,
          percentage: response.data.percentage,
          answers: response.data.answers
        });
        
        // Check if quiz data is populated
        if (response.data.quiz) {
          console.log('✅ Quiz data is populated:', response.data.quiz);
        } else if (response.data.quizId) {
          console.log('⚠️ Quiz data not populated, only quizId available:', response.data.quizId);
        } else {
          console.log('❌ No quiz or quizId data found');
        }
        
        setAttempt(response.data);
        console.log('✅ Attempt state updated successfully');
      } catch (error: any) {
        console.error('❌ Error fetching quiz attempt:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        toast.error('Failed to load quiz results');
        router.push('/');
      } finally {
        console.log('✅ Fetch attempt completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [userId, attemptId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    if (percentage >= 80) return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
    return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great Job!';
    if (percentage >= 70) return 'Good Work!';
    if (percentage >= 60) return 'Keep Practicing!';
    return 'Need More Study';
  };

  console.log('🎯 Render state:');
  console.log('  - loading:', loading);
  console.log('  - userId:', userId);
  console.log('  - attempt:', attempt);
  console.log('  - attempt.quiz:', attempt?.quiz);
  console.log('  - attempt.quizId:', attempt?.quizId);

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !userId) {
    console.log('❌ No attempt or userId, showing error state');
    console.log('  - attempt exists:', !!attempt);
    console.log('  - userId exists:', !!userId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Quiz results not found or access denied</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg hover:opacity-90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering main content');
  
  // Use quiz data from either quiz or quizId field
  const quiz = attempt.quiz || attempt.quizId;
  console.log('🎯 Using quiz data:', quiz);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quiz Results</h1>
              <p className="text-gray-600 dark:text-gray-400">{quiz?.title || 'Loading...'}</p>
            </div>
            
            <Link
              href={`/exams/${(() => {
                let examId = '';
                if (quiz?.examId) {
                  if (
                    typeof quiz.examId === 'object' &&
                    quiz.examId !== null &&
                    typeof (quiz.examId as { _id?: string })._id === 'string'
                  ) {
                    examId = (quiz.examId as { _id: string })._id;
                  } else if (typeof quiz.examId === 'string') {
                    examId = quiz.examId;
                  }
                }
                  console.log('🔗 Exam link examId:', examId);
                return examId;
              })()}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Exam
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Score Overview */}
        <div className={`rounded-2xl border-2 p-8 mb-8 ${getGradeBg(attempt?.percentage || 0)}`}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Award className={`h-16 w-16 ${getGradeColor(attempt?.percentage || 0)}`} />
            </div>
            <h2 className={`text-4xl font-bold mb-2 ${getGradeColor(attempt?.percentage || 0)}`}>
              {attempt?.percentage || 0}%
            </h2>
            <p className={`text-xl font-semibold mb-4 ${getGradeColor(attempt?.percentage || 0)}`}>
              {getGradeText(attempt?.percentage || 0)}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              You scored {attempt?.score || 0} out of {quiz?.totalQuestions || 0} questions correctly
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Score</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {attempt?.score || 0}/{quiz?.totalQuestions || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Taken</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatTime(attempt?.totalTimeTaken || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {attempt?.percentage || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Question Review</h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(() => {
              console.log('🎨 Rendering questions');
              console.log('📋 Quiz questions:', quiz?.questions);
              console.log('📊 Attempt answers:', attempt?.answers);
              
              return quiz?.questions?.map((question, index) => {
                const userAnswer = attempt.answers?.find(a => a.questionIndex === index);
                const isCorrect = userAnswer?.isCorrect || false;
                
                console.log(`🎯 Question ${index + 1}:`, {
                  question: question.question,
                  userAnswer,
                  isCorrect
                });
                
                return (
                  <div key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">
                          {index + 1}. {question.question}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          {question.options?.map((option, optionIndex) => {
                            const isSelected = userAnswer?.selectedOption === optionIndex;
                            const isCorrectOption = question.correctAnswer === optionIndex;
                            
                            return (
                              <div 
                                key={optionIndex} 
                                className={`p-3 rounded-lg border ${
                                  isCorrectOption 
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                    : isSelected 
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-800 dark:text-gray-200">{option}</span>
                                  <div className="flex items-center gap-2">
                                    {isCorrectOption && (
                                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                        Correct
                                      </span>
                                    )}
                                    {isSelected && !isCorrectOption && (
                                      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                                        Your Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {question.explanation && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Explanation:</h4>
                            <p className="text-blue-700 dark:text-blue-300 text-sm">{question.explanation}</p>
                          </div>
                        )}
                        
                        {userAnswer && (
                          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Time taken: {formatTime(userAnswer.timeTaken)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) || [];
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href={`/quiz-history`}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            onClick={() => console.log('🔗 Navigating to quiz history')}
          >
            <TrendingUp className="h-4 w-4" />
            View All Results
          </Link>
          
          <Link
            href={`/quiz/${quiz?._id || ''}`}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            onClick={() => console.log('🔗 Retaking quiz:', quiz?._id)}
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
