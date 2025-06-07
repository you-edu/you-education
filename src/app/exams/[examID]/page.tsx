import React from 'react';
import { Calendar, BookOpen, FileText, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ExamDetailsPage = () => {
  // Sample data - replace with your actual data props
  const examData = {
    id: "advanced-mathematics-101",
    subjectName: "Advanced Mathematics",
    description: "Comprehensive examination covering calculus, linear algebra, and differential equations. This exam tests your understanding of advanced mathematical concepts and problem-solving abilities across multiple domains of mathematics.",
    createdAt: "2024-03-15",
    examDate: "2024-04-20",
    chapters: [
      {
        id: 1,
        heading: "Differential Calculus",
        subtopics: [
          "Limits and Continuity", "Derivatives and Applications", "Chain Rule and Implicit Differentiation", 
          "Optimization Problems", "Related Rates", "Mean Value Theorem", "L'Hôpital's Rule", 
          "Curve Sketching", "Higher Order Derivatives", "Parametric Equations", "Polar Coordinates"
        ]
      },
      {
        id: 2,
        heading: "Integral Calculus",
        subtopics: [
          "Indefinite Integrals", "Definite Integrals", "Integration by Parts", "Trigonometric Substitution", 
          "Applications of Integration", "Area Between Curves", "Volume of Solids", "Arc Length", 
          "Surface Area", "Improper Integrals", "Numerical Integration"
        ]
      },
      {
        id: 3,
        heading: "Linear Algebra",
        subtopics: [
          "Matrices and Determinants", "Vector Spaces", "Eigenvalues and Eigenvectors", 
          "Linear Transformations", "Systems of Linear Equations", "Matrix Operations", 
          "Gaussian Elimination", "Vector Operations", "Dot Product", "Cross Product", 
          "Orthogonality", "Diagonalization"
        ]
      },
      {
        id: 4,
        heading: "Differential Equations",
        subtopics: [
          "First Order Differential Equations", "Second Order Linear Equations", "Laplace Transforms", 
          "Series Solutions", "Applications in Physics", "Separable Equations", "Exact Equations", 
          "Integrating Factors", "Homogeneous Equations", "Bernoulli Equations", "Power Series Solutions"
        ]
      }
    ]
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          {/* Description Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-black dark:to-gray-800 px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <FileText className="mr-3 h-6 w-6" />
                Exam Overview
              </h2>
            </div>
            <div className="p-8">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {examData.description}
              </p>
            </div>
          </div>

          {/* Date Info Card */}
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
              {examData.chapters.map((chapter, index) => (
                <div key={chapter.id} className="group">
                  {/* Chapter Header */}
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-black dark:to-gray-800 text-gray-800 dark:text-gray-100 rounded-xl flex items-center justify-center font-bold text-lg mr-6 shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                        {chapter.heading}
                      </h3>
                      
                      {/* Topics as comma-separated paragraph */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                          {chapter.subtopics.join(', ')}
                        </p>
                      </div>
                      
                      {/* Aesthetic Chapter Navigation Button */}
                      <div className="mt-6 flex justify-end">
                        <Link 
                          href={`/exams/${examData.id}/chapters/${chapter.id}`} 
                          className="group relative overflow-hidden flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                            View Chapter Details
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
                  {index < examData.chapters.length - 1 && (
                    <div className="border-b border-gray-200 dark:border-gray-700 my-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-12">
          <button className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-gray-800 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:text-gray-100 dark:bg-gradient-to-r dark:from-black dark:via-gray-900 dark:to-black rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-300 dark:border-gray-700">
            <span className="relative z-10">Begin Examination</span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-800 dark:to-black rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsPage;