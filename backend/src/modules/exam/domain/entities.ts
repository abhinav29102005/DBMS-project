/**
 * UIMS Exam Module — Domain Entities
 */

export interface ExamType {
  id: string;
  code: string;
  name: string;
}

export interface Exam {
  id: string;
  courseOfferingId: string;
  examTypeId: string;
  name: string;
  maxMarks: number;
  weightagePercent: number;
}

export interface Mark {
  examId: string;
  studentId: string;
  marksObtained: number;
}

export interface FinalResult {
  id: string;
  courseOfferingId: string;
  studentId: string;
  totalMarks: number;
  gradeCode: string;
  gradePoints: number;
  resultStatus: string;
}
