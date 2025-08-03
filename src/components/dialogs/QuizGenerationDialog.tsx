'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface QuizGenerationDialogProps {
  examId: string;
  userId: string;
  trigger: React.ReactNode;
  onQuizGenerated?: () => void;
}

export const QuizGenerationDialog: React.FC<QuizGenerationDialogProps> = ({ 
  examId, 
  userId, 
  trigger, 
  onQuizGenerated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    
    toast.info(
      <div className="flex flex-col">
        <span className="font-medium">Generating quiz...</span>
        <span className="text-sm opacity-80">This may take a few moments.</span>
      </div>
    );

    try {
      const result = await axios.post('/api/quiz/generate', {
        examId,
        userId,
        difficulty,
        numberOfQuestions
      });
      
      if (result.data.success) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-medium">Quiz generated successfully!</span>
            <span className="text-sm opacity-80">Ready to take the quiz.</span>
          </div>
        );
        setIsOpen(false);
        onQuizGenerated?.();
      } else {
        toast.error(`Failed to generate quiz: ${result.data.error}`);
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      if (error.response?.data?.message?.includes('already exists')) {
        toast.info('A quiz with this difficulty already exists for this exam.');
      } else {
        toast.error('Failed to generate quiz. Please try again later.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const difficultyOptions = [
    {
      value: 'easy' as const,
      label: 'Easy',
      description: 'Basic concepts and definitions',
      color: 'bg-green-100 text-green-800 border-green-200',
      timeEstimate: '15 min'
    },
    {
      value: 'medium' as const,
      label: 'Medium',
      description: 'Application and analysis questions',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      timeEstimate: '20 min'
    },
    {
      value: 'hard' as const,
      label: 'Hard',
      description: 'Complex scenarios and critical thinking',
      color: 'bg-red-100 text-red-800 border-red-200',
      timeEstimate: '30 min'
    }
  ];

  const questionOptions = [5, 10, 15, 20, 25];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Quiz
          </DialogTitle>
          <DialogDescription>
            Create a customized quiz based on your exam chapters and topics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Difficulty Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Select Difficulty Level
            </label>
            <div className="space-y-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    difficulty === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {option.label}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded border ${option.color}`}>
                          {option.timeEstimate}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      difficulty === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {difficulty === option.value && (
                        <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Number of Questions
            </label>
            <div className="grid grid-cols-5 gap-2">
              {questionOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => setNumberOfQuestions(num)}
                  className={`p-2 text-center rounded-lg border transition-colors ${
                    numberOfQuestions === num
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Quiz Summary</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Questions: {numberOfQuestions}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Estimated time: {difficultyOptions.find(opt => opt.value === difficulty)?.timeEstimate}</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
