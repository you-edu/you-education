'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Calendar, Clock, BookOpen, Brain, TrendingUp, Star, ChevronRight, Play, CheckCircle } from 'lucide-react';

interface Exam {
  subject: string;
  description: string;
  date: string;
  duration: string;
  daysLeft?: number;
  score?: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

const ExamCard = ({ exam, isUpcoming = true }: { exam: Exam, isUpcoming?: boolean }) => {
  return (
    <div className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      isUpcoming 
        ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800 hover:shadow-blue-500/25' 
        : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 hover:shadow-green-500/25'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          isUpcoming 
            ? 'bg-blue-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {isUpcoming ? <Calendar className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isUpcoming 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
        }`}>
          {isUpcoming ? `${exam.daysLeft} days left` : `Score: ${exam.score}%`}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {exam.subject}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
        {exam.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{exam.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{exam.duration}</span>
          </div>
        </div>
        
        <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 group-hover:scale-105 ${
          isUpcoming 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}>
          {isUpcoming ? <Play className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
          <span>{isUpcoming ? 'Start' : 'Review'}</span>
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <div className={`p-6 rounded-2xl bg-gradient-to-br ${color} border border-opacity-20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
        <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [userName] = useState("Alex");
  
  const upcomingExams = [
    {
      subject: "Mathematics - Calculus",
      description: "Comprehensive test covering derivatives, integrals, and applications of calculus.",
      date: "June 15, 2025",
      duration: "2 hours",
      daysLeft: 13
    },
    {
      subject: "Physics - Mechanics",
      description: "Classical mechanics including kinematics, dynamics, and energy conservation.",
      date: "June 20, 2025",
      duration: "1.5 hours",
      daysLeft: 18
    },
    {
      subject: "Chemistry - Organic",
      description: "Organic chemistry fundamentals, reactions, and molecular structures.",
      date: "June 25, 2025",
      duration: "2.5 hours",
      daysLeft: 23
    }
  ];

  const previousExams = [
    {
      subject: "Biology - Cell Structure",
      description: "Cellular biology and fundamental life processes examination.",
      date: "May 20, 2025",
      duration: "2 hours",
      score: 92
    },
    {
      subject: "English Literature",
      description: "Analysis of classical and modern literary works and techniques.",
      date: "May 15, 2025",
      duration: "1.5 hours",
      score: 88
    },
    {
      subject: "History - World Wars",
      description: "Comprehensive study of 20th century global conflicts and impacts.",
      date: "May 10, 2025",
      duration: "2 hours",
      score: 85
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
      <Navbar/>
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              <span>Smart Learning Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {userName}!
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ready to unlock your potential? Dive into our AI-powered mind maps and transform the way you learn. 
              Every concept becomes crystal clear with our visual learning approach.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Create Mind Map</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <TrendingUp className="w-5 h-5" />
                <span>View Progress</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={BookOpen} 
            label="Study Sessions" 
            value="24" 
            color="from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Average Score" 
            value="88%" 
            color="from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" 
          />
          <StatCard 
            icon={Star} 
            label="Mind Maps Created" 
            value="15" 
            color="from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" 
          />
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upcoming Exams</h2>
            <p className="text-gray-600 dark:text-gray-400">Stay prepared and ace your upcoming challenges</p>
          </div>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {upcomingExams.map((exam, index) => (
            <ExamCard key={index} exam={exam} isUpcoming={true} />
          ))}
        </div>
      </div>

      {/* Previous Exams */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Previous Exams</h2>
            <p className="text-gray-600 dark:text-gray-400">Review your past performance and identify areas for improvement</p>
          </div>
          <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center space-x-1 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {previousExams.map((exam, index) => (
            <ExamCard key={index} exam={exam} isUpcoming={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;