"use client"
import React, { useState, useEffect } from 'react'
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";

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
  
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Include Navbar at the top of the page */}
      <Navbar />
      
      {/* Main content area */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Dashboard header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your exams and track your progress.</p>
          </div>
          
          <div className="flex items-center self-start md:self-auto">
            <button 
              className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm"
              onClick={() => console.log("Add exam clicked")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
              Add New Exam
            </button>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Current Exams</h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-md font-medium">{currentExams.length}</span>
            </div>
            <p className="text-2xl font-bold mt-2 dark:text-white">{currentExams.length} Upcoming</p>
            <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="bg-black dark:bg-white h-1 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Completed Exams</h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-md font-medium">{completedExams.length}</span>
            </div>
            <p className="text-2xl font-bold mt-2 dark:text-white">{completedExams.length} Finished</p>
            <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="bg-gray-700 dark:bg-gray-400 h-1 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Average Score</h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-md font-medium">Last 30 days</span>
            </div>
            <p className="text-2xl font-bold mt-2 dark:text-white">88.5%</p>
            <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="bg-gray-900 dark:bg-gray-300 h-1 rounded-full" style={{ width: '88.5%' }}></div>
            </div>
          </div>
        </div>
        
        {/* Current Exams Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Current Exams</h2>
            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentExams.map(exam => (
              <div 
                key={exam.id} 
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 mb-2">{exam.subject}</span>
                    <h3 className="font-semibold text-lg group-hover:text-gray-800 dark:text-white dark:group-hover:text-gray-300">{exam.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(exam.date) > new Date() ? 
                        `Due ${new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 
                        `Overdue since ${new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      }
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
                
                <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-gray-700 dark:bg-gray-400 h-1 rounded-full" style={{ width: `${Math.floor(Math.random() * 70) + 10}%` }}></div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="text-xs font-medium dark:text-gray-300">In progress</span>
                </div>
              </div>
            ))}
          </div>
          
          {currentExams.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No current exams</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Start by adding your first exam</p>
              <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">Add your first exam</button>
            </div>
          )}
        </section>
        
        {/* Completed Exams Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Completed Exams</h2>
            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {completedExams.map(exam => (
              <div 
                key={exam.id} 
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 mb-2">{exam.subject}</span>
                    <h3 className="font-semibold text-lg group-hover:text-gray-800 dark:text-white dark:group-hover:text-gray-300">{exam.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Completed on {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white rounded-md text-sm">
                    {exam.score}
                  </div>
                </div>
                
                <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-black dark:bg-white h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                  <span className="text-xs font-medium flex items-center gap-1 text-gray-800 dark:text-gray-300">
                    <span className="h-2 w-2 rounded-full bg-gray-800 dark:bg-gray-300"></span>
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {completedExams.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No completed exams yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Complete your first exam to see results here</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Page
