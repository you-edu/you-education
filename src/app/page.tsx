"use client"
import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { AddExamCard, ExamData } from '@/components/AddExamCard'
import ExamsList from '@/components/Examlist'
import axios from 'axios'


interface Exam {
  userId: string;
  subjectName: string;
  description: string;
  createdAt: Date;
  examDate: Date;
}
const Page = () => {
  const [showAddExamCard, setShowAddExamCard] = useState(false);

  // Sample data - would come from your actual data source
  const [currentExams, setCurrentExams] = useState<Exam[]>([]);
  
  const [completedExams, setCompletedExams] = useState<Exam[]>([]);

  // Here you would fetch data from your API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const currentDate = new Date();
        // Fetching exams from the API using Get request with axios
        const response = await axios.get('/api/exams'); 
        console.log('Fetched exams:', response.data);
        const completedExamsList = [];
        const currentExamsList = [];
        // Data would contain the list of all exams it can be previous or upcoming
        // Obtaining current and completed exams from the data

        for( const exam of response.data) {
          if(exam.examDate < currentDate){
            completedExamsList.push({
              examId : exam._id,
              userId: exam.userId,
              subjectName: exam.subjectName,
              description: exam.description,
              createdAt: new Date(exam.createdAt),
              examDate: new Date(exam.examDate)
            });
          }else{
            currentExamsList.push({
              examId : exam._id, 
              userId: exam.userId,
              subjectName: exam.subjectName,
              description: exam.description,
              createdAt: new Date(exam.createdAt),
              examDate: new Date(exam.examDate)
            });
          }
        }
        setCurrentExams(currentExamsList);
        setCompletedExams(completedExamsList);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };
    
    fetchExams();
  }, []);

  const handleAddExam = () => {
    setShowAddExamCard(true);
    document.body.style.overflow = 'hidden';
  };

  const handleSaveExam = async (examData: ExamData) => {
    try {

      // Send to server
      const response = await axios.post('/api/exams', examData);
      const savedExam = response.data;
      
      // Update state with the exam returned from server
      setCurrentExams([...currentExams, savedExam]);
      
      // Close modal
      setShowAddExamCard(false);
      document.body.style.overflow = 'auto';
    } catch (error) {
      console.error('Error saving exam:', error);
      // Handle error (show error message to user)
    }
  };

  const handleCancelAddExam = () => {
    setShowAddExamCard(false);
    document.body.style.overflow = 'auto';
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      
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
              onClick={handleAddExam}
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
          {/* Stats cards content - unchanged */}
          <div className="bg-gray-50 dark:bg-black/90 shadow-lg shadow-gray-500 rounded-2xl p-8 border border-gray-100  dark:border-white/10  transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-600 dark:text-white/70 uppercase text-sm tracking-wide">Current Exams</h3>
              <span className="bg-white dark:bg-black/70 text-black dark:text-white text-sm px-3 py-1 rounded-full font-bold shadow-sm">{currentExams.length}</span>
            </div>
            <p className="text-3xl font-bold mb-4">{currentExams.length} Upcoming</p>
            <div className="h-2 w-full bg-gray-200 dark:bg-black/50 rounded-full overflow-hidden">
              <div className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          {/* Other stats cards... */}
        </div>
        
        {/* Current Exams Section - Now using the component */}
        <ExamsList 
          title="Current Exams" 
          exams={currentExams}
          type="current" 
          onAddExam={handleAddExam} 
        />
        
        {/* Completed Exams Section - Now using the component */}
        <ExamsList 
          title="Completed Exams" 
          exams= {completedExams}
          type="completed" 
        />
      </div>

      {/* Modal Overlay for Add Exam Card */}
      {showAddExamCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="w-full max-w-md animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <AddExamCard onSave={handleSaveExam} onCancel={handleCancelAddExam} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Page