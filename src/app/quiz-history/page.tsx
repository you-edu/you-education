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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering main content');

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-3 tracking-tight">Quiz History</h1>
              <p className="text-gray-500 dark:text-white/70 text-lg">
                {examId ? 'Quiz attempts for this exam' : 'All your quiz attempts'}
              </p>
            </div>
            
            {examId && (
              <Link
                href={`/exams/${examId}`}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm"
              >
                Back to Exam
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-white/70 uppercase tracking-wide">Total Quizzes</h3>
                <p className="text-4xl font-bold text-black dark:text-white">{stats.totalQuizzes}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-white/70 uppercase tracking-wide">Average Score</h3>
                <p className="text-4xl font-bold text-black dark:text-white">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-white/70 uppercase tracking-wide">Best Score</h3>
                <p className="text-4xl font-bold text-black dark:text-white">{stats.bestScore}%</p>
              </div>
              <Award className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-white/70 uppercase tracking-wide">Filter by performance:</span>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'excellent', label: 'Excellent (90%+)' },
                { value: 'good', label: 'Good (70-89%)' },
                { value: 'average', label: 'Average (50-69%)' },
                { value: 'poor', label: 'Below 50%' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    console.log('🔍 Filter button clicked:', option.value);
                    setFilter(option.value as any);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === option.value
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-black/70 text-gray-700 dark:text-white/70 hover:bg-gray-300 dark:hover:bg-black/50 border border-gray-300 dark:border-white/20'
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
          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-12 text-center">
            <BookOpen className="h-20 w-20 text-gray-400 dark:text-white/50 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-black dark:text-white mb-3">No Quiz Attempts Found</h3>
            <p className="text-gray-500 dark:text-white/70 mb-6 text-lg">
              {filter === 'all' ? 'You haven\'t taken any quizzes yet.' : `No quizzes found with ${filter} performance.`}
            </p>
            {!examId && (
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm"
              >
                Browse Exams
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
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
                  <div key={attempt._id} className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-gray-600 transition-all duration-300">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                            {quiz?.title || 'Quiz Title Not Available'}
                          </h3>
                          <p className="text-gray-500 dark:text-white/70 text-lg">
                            {quiz?.examId && typeof quiz.examId === 'object' && 'subjectName' in quiz.examId 
                              ? (quiz.examId as any).subjectName 
                              : 'Subject'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${badge.color}`}>
                            {badge.text}
                          </span>
                          
                          <Link
                            href={`/quiz/results/${attempt._id}`}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-white/70">Score:</span>
                            <p className="font-bold text-black dark:text-white">
                              {attempt.score}/{quiz?.totalQuestions || 0} ({attempt.percentage}%)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-white/70">Time:</span>
                            <p className="font-bold text-black dark:text-white">
                              {formatTime(attempt.totalTimeTaken)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-white/70">Date:</span>
                            <p className="font-bold text-black dark:text-white">
                              {formatDate(attempt.completedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-white/70">Difficulty:</span>
                            <p className="font-bold text-black dark:text-white capitalize">
                              {quiz?.difficulty || 'N/A'}
                            </p>
                          </div>
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
