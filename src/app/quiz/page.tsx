'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Quiz } from '@/lib/types';
import { toast } from 'sonner';
import { Play, Clock, Target, Calendar, BookOpen, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const QuizDashboardPage = () => {
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
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

  // Fetch all quizzes
  useEffect(() => {
    console.log('🚀 useEffect - fetchQuizzes triggered');
    console.log('📊 Current userId:', userId);
    
    const fetchQuizzes = async () => {
      if (!userId) {
        console.log('⚠️ No userId available, skipping fetch');
        return;
      }
      
      console.log('🔄 Starting to fetch quizzes...');
      
      try {
        const url = `/api/quiz?userId=${userId}`;
        console.log('🌐 Quiz fetch URL:', url);
        
        const response = await axios.get(url);
        console.log('📬 Quizzes response:', response.data);
        console.log('🔢 Number of quizzes fetched:', response.data.length);
        
        // Log each quiz details
        response.data.forEach((quiz: Quiz, index: number) => {
          console.log(`📋 Quiz ${index + 1}:`, {
            id: quiz._id,
            title: quiz.title,
            examId: quiz.examId,
            difficulty: quiz.difficulty,
            totalQuestions: quiz.totalQuestions,
            timeLimit: quiz.timeLimit
          });
        });
        
        setQuizzes(response.data);
        console.log('✅ Quizzes state updated successfully');
      } catch (error: any) {
        console.error('❌ Error fetching quizzes:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        toast.error('Failed to load quizzes');
      } finally {
        console.log('✅ Fetch quizzes completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [userId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  console.log('🎯 Render state:');
  console.log('  - loading:', loading);
  console.log('  - userId:', userId);
  console.log('  - quizzes.length:', quizzes.length);
  console.log('  - quizzes:', quizzes);

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading quizzes...</p>
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
              <h1 className="text-4xl font-bold text-black dark:text-white mb-3 tracking-tight">Quiz Dashboard</h1>
              <p className="text-gray-500 dark:text-white/70 text-lg">
                All your quizzes in one place
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/quiz-history"
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-sm"
              >
                <TrendingUp className="h-4 w-4" />
                View History
              </Link>
              
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-black/90 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-black/70 rounded-xl font-medium transition-all duration-200 shadow-sm border border-gray-200 dark:border-white/10"
              >
                <BookOpen className="h-4 w-4" />
                Browse Exams
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {quizzes.length === 0 ? (
          (() => {
            console.log('📋 No quizzes found, showing empty state');
            return (
              <div className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 p-12 text-center">
                <Target className="h-20 w-20 text-gray-400 dark:text-white/50 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-black dark:text-white mb-3">No Quizzes Found</h3>
                <p className="text-gray-500 dark:text-white/70 mb-8 text-lg max-w-md mx-auto">
                  You haven't created any quizzes yet. Start by browsing your exams and generating quizzes.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  Browse Exams
                </Link>
              </div>
            );
          })()
        ) : (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-black/90 shadow-lg shadow-gray-500 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Total Quizzes</h3>
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-black dark:text-white">{quizzes.length}</p>
              </div>

              <div className="bg-gray-50 dark:bg-black/90 shadow-lg shadow-gray-500 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Easy Quizzes</h3>
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-black dark:text-white">
                  {quizzes.filter(q => q.difficulty === 'easy').length}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-black/90 shadow-lg shadow-gray-500 rounded-2xl p-6 border border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Hard Quizzes</h3>
                  <Target className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-black dark:text-white">
                  {quizzes.filter(q => q.difficulty === 'hard').length}
                </p>
              </div>
            </div>

            {/* Quizzes Grid */}
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6 tracking-tight">Your Quizzes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz, index) => {
                  console.log(`🎨 Rendering quiz ${index + 1}:`, quiz);
                  console.log(`🎯 Quiz examId type:`, typeof quiz.examId);
                  console.log(`🎯 Quiz examId value:`, quiz.examId);
                  
                  // Determine the exam link
                  let examLink = '/';
                  if (quiz.examId) {
                    if (typeof quiz.examId === 'object' && quiz.examId !== null && '_id' in quiz.examId) {
                      examLink = `/exams/${(quiz.examId as { _id: string })._id}`;
                      console.log(`🔗 Exam link (object):`, examLink);
                    } else if (typeof quiz.examId === 'string') {
                      examLink = `/exams/${quiz.examId}`;
                      console.log(`🔗 Exam link (string):`, examLink);
                    } else {
                      console.log(`⚠️ Unknown examId format:`, quiz.examId);
                    }
                  }
                  
                  return (
                    <div key={quiz._id} className="bg-gray-50 dark:bg-black/90 rounded-2xl shadow-lg shadow-gray-500 border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-gray-600 transition-all duration-300">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-black dark:text-white mb-2 line-clamp-2 text-lg">
                              {quiz.title}
                            </h3>
                            {quiz.description && (
                              <p className="text-sm text-gray-500 dark:text-white/70 line-clamp-2 mb-3">
                                {quiz.description}
                              </p>
                            )}
                          </div>
                          
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border flex-shrink-0 ml-3 ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-3 text-sm text-gray-500 dark:text-white/70 mb-6">
                          <div className="flex items-center gap-3">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span>{quiz.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{quiz.timeLimit} minutes</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>Created {formatDate(quiz.createdAt)}</span>
                          </div>
                          {quiz.examId && typeof quiz.examId === 'object' && 'subjectName' in quiz.examId && (
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {(quiz.examId as any).subjectName}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Link
                            href={`/quiz/${quiz._id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-200 text-sm font-medium shadow-sm"
                            onClick={() => console.log(`🎯 Taking quiz:`, quiz._id)}
                          >
                            <Play className="h-4 w-4" />
                            Take Quiz
                          </Link>
                          
                          <Link
                            href={examLink}
                            className="px-4 py-3 bg-gray-200 dark:bg-black/70 text-gray-700 dark:text-white/70 hover:bg-gray-300 dark:hover:bg-black/50 rounded-xl transition-all duration-200 text-sm border border-gray-300 dark:border-white/20"
                            title="View Exam"
                            onClick={() => console.log(`🎯 Viewing exam:`, examLink)}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboardPage;
