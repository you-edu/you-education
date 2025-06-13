// Exam related interfaces
export interface ExamData {
  examId?: string;
  userId?: string;
  subjectName: string;
  description: string;
  createdAt: Date;
  examDate: Date;
  syllabus?: File;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ExamCardProps {
  exam: ExamData;
  type: 'current' | 'completed';
}


export interface ExamsListProps {
  title: string;
  exams: ExamData[];
  type: 'current' | 'completed';
  onAddExam?: () => void;
}

export interface AddExamCardProps {
  onSave: (examData: ExamData) => void
  onCancel: () => void
}