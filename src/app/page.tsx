"use client"
import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

const Page = () => {
  // Sample data - would come from your actual data source
  const currentExams = [
    { id: 1, title: "Mathematics Final", date: "2023-12-15", subject: "Mathematics" },
    { id: 2, title: "Physics Mid-term", date: "2023-11-28", subject: "Physics" },
    { id: 3, title: "Computer Science Project", date: "2023-12-20", subject: "CS" },
  ];
  
  const completedExams = [
    { id: 4, title: "Biology Quiz", date: "2023-11-10", subject: "Biology", score: "85%" },
    { id: 5, title: "Chemistry Lab Test", date: "2023-10-25", subject: "Chemistry", score: "92%" },
  ];
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Add Navbar */}
      <Navbar />
      
      {/* Main content area */}
      <div className="container max-w-6xl mx-auto px-6 py-12">
        {/* Dashboard header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-white/70 text-lg">Manage your exams and track your progress with precision.</p>
          </div>
          
          <div className="flex items-center self-start md:self-auto">
            <button 
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 flex items-center gap-3 shadow-sm font-medium"
              onClick={() => console.log("Add exam clicked")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
              Add New Exam
            </button>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl p-8 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Current Exams</h3>
              <span className="bg-white dark:bg-black/70 text-black dark:text-white text-sm px-3 py-1 rounded-full font-bold shadow-sm">{currentExams.length}</span>
            </div>
            <p className="text-3xl font-bold mb-4">{currentExams.length} Upcoming</p>
            <div className="h-2 w-full bg-gray-200 dark:bg-black/50 rounded-full overflow-hidden">
              <div className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl p-8 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Completed Exams</h3>
              <span className="bg-white dark:bg-black/70 text-black dark:text-white text-sm px-3 py-1 rounded-full font-bold shadow-sm">{completedExams.length}</span>
            </div>
            <p className="text-3xl font-bold mb-4">{completedExams.length} Finished</p>
            <div className="h-2 w-full bg-gray-200 dark:bg-black/50 rounded-full overflow-hidden">
              <div className="bg-gray-600 dark:bg-white/50 h-2 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-black/90 rounded-2xl p-8 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Average Score</h3>
              <span className="bg-white dark:bg-black/70 text-black dark:text-white text-sm px-3 py-1 rounded-full font-bold shadow-sm">30 days</span>
            </div>
            <p className="text-3xl font-bold mb-4">88.5%</p>
            <div className="h-2 w-full bg-gray-200 dark:bg-black/50 rounded-full overflow-hidden">
              <div className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500" style={{ width: '88.5%' }}></div>
            </div>
          </div>
        </div>
        
        {/* Current Exams Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Current Exams</h2>
            <button className="text-gray-500 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 font-medium">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentExams.map(exam => (
              <div 
                key={exam.id} 
                className="bg-white dark:bg-black/90 border-2 border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/30 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-black/70 text-gray-700 dark:text-white/70 mb-3 font-semibold uppercase tracking-wide">{exam.subject}</span>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-gray-700 dark:group-hover:text-white/80 transition-colors">{exam.title}</h3>
                    <p className="text-gray-500 dark:text-white/60">
                      {new Date(exam.date) > new Date() ? 
                        `Due ${new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 
                        `Overdue since ${new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      }
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-gray-50 dark:bg-black/70 rounded-full flex items-center justify-center group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
                
                <div className="mb-4 h-2 w-full bg-gray-100 dark:bg-black/50 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-400 to-gray-600 dark:from-white/40 dark:to-white/70 h-2 rounded-full transition-all duration-700" style={{ width: `${Math.floor(Math.random() * 70) + 10}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wide font-semibold">Progress</span>
                  <span className="text-sm font-bold bg-gray-100 dark:bg-black/70 px-3 py-1 rounded-full">In Progress</span>
                </div>
              </div>
            ))}
          </div>
          
          {currentExams.length === 0 && (
            <div className="text-center py-20 bg-gray-50 dark:bg-black/90 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-black/70 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 dark:text-white/80 font-bold text-lg mb-2">No current exams</p>
              <p className="text-gray-500 dark:text-white/60 mb-6">Start by adding your first exam to get organized</p>
              <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium">Add your first exam</button>
            </div>
          )}
        </section>
        
        {/* Completed Exams Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Completed Exams</h2>
            <button className="text-gray-500 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 font-medium">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedExams.map(exam => (
              <div 
                key={exam.id} 
                className="bg-white dark:bg-black/90 border-2 border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/30 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-black/70 text-gray-700 dark:text-white/70 mb-3 font-semibold uppercase tracking-wide">{exam.subject}</span>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-gray-700 dark:group-hover:text-white/80 transition-colors">{exam.title}</h3>
                    <p className="text-gray-500 dark:text-white/60">
                      Completed on {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-lg">
                    {exam.score}
                  </div>
                </div>
                
                <div className="mb-4 h-2 w-full bg-gray-100 dark:bg-black/50 rounded-full overflow-hidden">
                  <div className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wide font-semibold">Status</span>
                  <span className="text-sm font-bold flex items-center gap-2 bg-gray-100 dark:bg-black/70 px-3 py-1 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-black dark:bg-white"></span>
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {completedExams.length === 0 && (
            <div className="text-center py-20 bg-gray-50 dark:bg-black/90 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-black/70 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 dark:text-white/80 font-bold text-lg mb-2">No completed exams yet</p>
              <p className="text-gray-500 dark:text-white/60">Complete your first exam to see results here</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Page