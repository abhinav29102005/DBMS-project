/**
 * UIMS Academic Module — Domain Entities
 */

export interface Department {
  id: string;
  code: string;
  name: string;
  establishedYear?: number;
}

export interface Program {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  degreeType: string;
  durationSemesters: number;
}

export interface Student {
  id: string;
  userId: string;
  studentNo: string;
  departmentId: string;
  programId: string;
  admissionYear: number;
  currentSemester: number;
  lifecycleState: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'alumni';
  version: number;
}

export interface Faculty {
  id: string;
  userId: string;
  employeeNo: string;
  departmentId: string;
  designation: string;
  employmentState: 'active' | 'on_leave' | 'retired' | 'terminated';
}

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  credits: number;
  departmentId: string;
  courseType: 'core' | 'elective' | 'lab' | 'project' | 'seminar';
  prerequisiteId?: string;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  semesterId: string;
  sectionCode: string;
  primaryFacultyId?: string;
  capacity: number;
  enrollmentCount: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  enrollmentStatus: 'enrolled' | 'withdrawn' | 'completed' | 'failed';
  registeredAt: Date;
}
