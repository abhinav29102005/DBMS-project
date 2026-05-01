export type Role = 'student' | 'faculty' | 'admin' | 'staff' | 'librarian' | 'warden' | 'exam_controller';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface PaginatedResponse<T> {
  items:       T[];
  next_cursor: string | null;
  count_hint:  number;
}

export interface ApiErrorResponse {
  code:           string;
  message:        string;
  correlation_id: string;
  detail?:        Record<string, string[]>;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department_id: string;
}

export interface CourseOffering {
  id: string;
  course_id: string;
  faculty_id: string;
  semester_id: string;
  section: string;
  room: string;
  schedule: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  offering_id: string;
  status: 'active' | 'dropped' | 'completed';
}

export interface ExamResult {
  id: string;
  student_id: string;
  offering_id: string;
  marks_internal: number;
  marks_external: number;
  grade: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

export interface HostelAllocation {
  id: string;
  student_id: string;
  bed_id: string;
  allocated_at: string;
  deallocated_at?: string;
}

export interface LibraryIssue {
  id: string;
  book_id: string;
  member_id: string;
  issued_at: string;
  due_date: string;
  returned_at?: string;
}

export interface StudentStats {
  attendance: string;
  gpa: string;
  coursesCount: number;
  fines: string;
}
