'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { QuizAttemptWithQuiz } from '@/lib/types';
import { toast } from 'sonner';
import { Clock, Award, TrendingUp, Filter, Calendar, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';

const QuizHistoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const { data: session } = useSession();
  
  console.log('🔍 QuizHistoryPage - Component initialized');
  console.log('📋 examId from searchParams:', examId);
  console.log('👤 session:', session);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [attempts, setAttempts] = useState<QuizAttemptWithQuiz[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttemptWithQuiz[]>([]);
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'average' | 'poor'>('all');

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

  // Fetch quiz attempts
  useEffect(() => {
    console.log('🚀 useEffect - fetchAttempts triggered');
    console.log('📊 Current userId:', userId);
    console.log('📝 Current examId:', examId);
    
    const fetchAttempts = async () => {
      if (!userId) {
        console.log('⚠️ No userId available, skipping fetch');
        return;
      }
      
      console.log('🔄 Starting to fetch attempts...');
      
      try {
        let url = `/api/quiz/attempt?userId=${userId}`;
        console.log('🌐 Base URL:', url);
        
        if (examId) {
          console.log('📚 ExamId provided, fetching quizzes for exam first');
          // If examId is provided, we need to fetch quizzes for that exam first
          const quizzesUrl = `/api/quiz?userId=${userId}&examId=${examId}`;
          console.log('🌐 Quizzes URL:', quizzesUrl);
          
          const quizzesResponse = await axios.get(quizzesUrl);
          console.log('📋 Quizzes response:', quizzesResponse.data);
          const quizzes = quizzesResponse.data;
          
          console.log('🔢 Number of quizzes found:', quizzes.length);
          
          // Then fetch attempts for all those quizzes
          const attemptPromises = quizzes.map((quiz: any) => {
            const attemptUrl = `/api/quiz/attempt?userId=${userId}&quizId=${quiz._id}`;
            console.log('🌐 Attempt URL for quiz:', attemptUrl);
            return axios.get(attemptUrl);
          });
          
          console.log('📊 Number of attempt requests:', attemptPromises.length);
          
          const attemptResponses = await Promise.all(attemptPromises);
          console.log('📬 Attempt responses:', attemptResponses.map(r => r.data));
          
          const allAttempts = attemptResponses.flatMap(response => response.data);
          console.log('📈 All attempts combined:', allAttempts);
          console.log('🔢 Total attempts count:', allAttempts.length);
          
          setAttempts(allAttempts);
        } else {
          console.log('📊 No examId, fetching all attempts');
          const response = await axios.get(url);
          console.log('📬 All attempts response:', response.data);
          console.log('🔢 Total attempts count:', response.data.length);
          setAttempts(response.data);
        }
      } catch (error: any) {
        console.error('❌ Error fetching quiz attempts:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        toast.error('Failed to load quiz history');
      } finally {
        console.log('✅ Fetch attempts completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [userId, examId]);

  // Filter attempts based on performance
  useEffect(() => {
    console.log('🚀 useEffect - filterAttempts triggered');
    console.log('📊 Current attempts:', attempts);
    console.log('🔍 Current filter:', filter);
    
    let filtered = attempts;
    
    switch (filter) {
      case 'excellent':
        filtered = attempts.filter(attempt => attempt.percentage >= 90);
        console.log('⭐ Excellent filtered attempts:', filtered);
        break;
      case 'good':
        filtered = attempts.filter(attempt => attempt.percentage >= 70 && attempt.percentage < 90);
        console.log('👍 Good filtered attempts:', filtered);
        break;
      case 'average':
        filtered = attempts.filter(attempt => attempt.percentage >= 50 && attempt.percentage < 70);
        console.log('📊 Average filtered attempts:', filtered);
        break;
      case 'poor':
        filtered = attempts.filter(attempt => attempt.percentage < 50);
        console.log('📉 Poor filtered attempts:', filtered);
        break;
      default:
        filtered = attempts;
        console.log('📋 All attempts (no filter):', filtered);
    }
    
    console.log('🔢 Filtered attempts count:', filtered.length);
    setFilteredAttempts(filtered);
  }, [attempts, filter]);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (percentage >= 70) return { text: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (percentage >= 50) return { text: 'Average', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Needs Work', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const getStats = () => {
    console.log('📊 Calculating stats for:', filteredAttempts);
    if (filteredAttempts.length === 0) {
      console.log('📊 No attempts, returning zero stats');
      return { avgScore: 0, totalQuizzes: 0, bestScore: 0 };
    }
    
    const avgScore = Math.round(filteredAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / filteredAttempts.length);
    const bestScore = Math.max(...filteredAttempts.map(attempt => attempt.percentage));
    
    const stats = {
      avgScore,
      totalQuizzes: filteredAttempts.length,
      bestScore
    };
    
    console.log('📊 Calculated stats:', stats);
    return stats;
  };

  const stats = getStats();

  console.log('🎯 Render state:');
  console.log('  - loading:', loading);
  console.log('  - userId:', userId);
  console.log('  - attempts.length:', attempts.length);
  console.log('  - filteredAttempts.length:', filteredAttempts.length);
  console.log('  - stats:', stats);

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering main content');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Quiz History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {examId ? 'Quiz attempts for this exam' : 'All your quiz attempts'}
              </p>
            </div>
            
            {examId && (
              <Link
                href={`/exams/${examId}`}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Back to Exam
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalQuizzes}</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Score</h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.bestScore}%</p>
              </div>
              <Award className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by performance:</span>
            
            <div className="flex gap-2">
              {[
                {
                  value: 'all',
                  label: 'All'
                },
                {
                  value: 'excellent',
                  label: 'Excellent (90%+)'
                },
                {
                  value: 'good',
                  label: 'Good (70-89%)'
                },
                {
                  value: 'average',
                  label: 'Average (50-69%)'
                },
                {
                  value: 'poor',
                  label: 'Below 50%'
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    console.log('🔍 Filter button clicked:', option.value);
                    setFilter(option.value as any);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Attempts List */}
        {filteredAttempts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Quiz Attempts Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' ? 'You haven\'t taken any quizzes yet.' : `No quizzes found with ${filter} performance.`}
            </p>
            {!examId && (
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Browse Exams
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              console.log('🎨 Rendering attempts list');
              const validAttempts = filteredAttempts.filter(attempt => {
                const hasQuiz = !!(attempt.quiz || attempt.quizId);
                console.log(`📋 Attempt ${attempt._id} has quiz:`, hasQuiz);
                console.log(`📋 Attempt quiz data:`, attempt.quiz || attempt.quizId);
                if (!hasQuiz) {
                  console.log(`⚠️ Attempt ${attempt._id} missing quiz data:`, attempt);
                }
                return hasQuiz;
              });
              console.log('✅ Valid attempts to render:', validAttempts.length);
              
              return validAttempts.map((attempt) => {
                const badge = getPerformanceBadge(attempt.percentage);
                const quiz = attempt.quiz || attempt.quizId; // Use quizId if quiz is not available
                console.log(`🎨 Rendering attempt ${attempt._id}:`, attempt);
                console.log(`🎯 Quiz data for attempt:`, quiz);
                
                return (
                  <div key={attempt._id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            {quiz?.title || 'Quiz Title Not Available'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {quiz?.examId && typeof quiz.examId === 'object' && 'subjectName' in quiz.examId 
                              ? (quiz.examId as any).subjectName 
                              : 'Subject'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                            {badge.text}
                          </span>
                          
                          <Link
                            href={`/quiz/results/${attempt._id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Score:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {attempt.score}/{quiz?.totalQuestions || 0} ({attempt.percentage}%)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Time:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {formatTime(attempt.totalTimeTaken)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Date:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {formatDate(attempt.completedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
                            {quiz?.difficulty || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistoryPage;
