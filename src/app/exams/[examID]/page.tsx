'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, BookOpen, FileText, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Chapter, ExamData } from '@/lib/types'; 

const ExamDetailsPage = () => {
  const params = useParams();
  const examId = params.examID as string;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        
        // First fetch the exam details
        const examResponse = await axios.get(`/api/exams/${examId}`);
        setExamData(examResponse.data);
        
        // Then fetch the chapters for this exam
        const chaptersResponse = await axios.get(`/api/exams/chapters?examId=${examId}`);
        setChapters(chaptersResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching exam data:', err);
        setError('Failed to load exam data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading exam details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !examData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error || 'Failed to load exam data'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black text-gray-800 dark:text-white">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {examData.subjectName}
              </h1>
              <div className="w-24 h-1 bg-gray-400 dark:bg-gray-400 mx-auto rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-black to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12 -mt-4">
        {/* Exam Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Info Card - combined or description-only */}
          <div className={`${examData.description ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden`}>
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-black dark:to-gray-800 px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <FileText className="mr-3 h-6 w-6" />
                Exam Overview
              </h2>
            </div>
            <div className="p-8">
              {examData.description ? (
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {examData.description}
                </p>
              ) : (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Course Summary</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        This course covers all essential topics required for the {examData.subjectName} exam. 
                        Review the chapters below to begin your preparation.
                      </p>
                    </div>
                  </div>
                  
                  {/* Embed Timeline directly when no description */}
                  <div className="flex-1 w-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Timeline</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDate(examData.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Exam Date:</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDate(examData.examDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Info Card - only show separately when there is a description */}
          {examData.description && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-800 dark:to-black px-6 py-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <Calendar className="mr-3 h-6 w-6" />
                  Timeline
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold">{formatDate(examData.createdAt)}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Exam Date</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">{formatDate(examData.examDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chapters Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-black dark:via-gray-900 dark:to-black px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center">
              <BookOpen className="mr-4 h-8 w-8" />
              Course Syllabus
            </h2>
          </div>

          <div className="p-8">
            <div className="space-y-12">
              {chapters.map((chapter, index) => (
                <div key={index} className="group">
                  {/* Chapter Header */}
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-black dark:to-gray-800 text-gray-800 dark:text-gray-100 rounded-xl flex items-center justify-center font-bold text-lg mr-6 shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                        {chapter.title}
                      </h3>
                      
                      {/* Topics as comma-separated paragraph */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                          {chapter.content.join(', ')}
                        </p>
                      </div>
                      
                      {/* Aesthetic Chapter Navigation Button */}
                      <div className="mt-6 flex justify-end">
                        <Link 
                          href={`/exams/chapters/${chapter.examId}`} 
                          className="group relative overflow-hidden flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                            Start Learning
                          </span>
                          <div className="relative flex items-center justify-center w-6 h-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300"></div>
                            <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-200 relative z-10" />
                          </div>
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Separator line for all but last chapter */}
                  {index < chapters.length - 1 && (
                    <div className="border-b border-gray-200 dark:border-gray-700 my-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsPage;