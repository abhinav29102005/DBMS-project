import { ShellLayout } from '@/components/layout/ShellLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, User, MapPin, Clock, Search } from 'lucide-react';
import Head from 'next/head';
import { Input } from '@/components/ui/Input';

const MOCK_COURSES = [
  { id: '1', code: 'CS201', name: 'Database Management Systems', credits: 4, faculty: 'Dr. Sarah Wilson', room: 'Lab 402', time: 'Mon, Wed 09:00 AM' },
  { id: '2', code: 'CS202', name: 'Software Engineering', credits: 4, faculty: 'Prof. David Miller', room: 'Room 101', time: 'Tue, Thu 11:30 AM' },
  { id: '3', code: 'CS203', name: 'Machine Learning', credits: 4, faculty: 'Dr. Alan Turing', room: 'Seminar Hall', time: 'Fri 02:30 PM' },
  { id: '4', code: 'MA201', name: 'Linear Algebra', credits: 3, faculty: 'Prof. Euler', room: 'Room 305', time: 'Mon, Wed 11:30 AM' },
];

export default function CoursesPage() {
  return (
    <ShellLayout role="student">
      <Head>
        <title>My Courses | Student Portal</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Courses</h1>
            <p className="text-sm text-gray-500">Currently enrolled courses for Fall 2023.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search courses..." className="pl-9 py-2 text-sm" />
            </div>
            <Button variant="primary">Register New</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MOCK_COURSES.map((course) => (
            <Card key={course.id} className="group hover:border-brand-500 transition-all hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer overflow-hidden border-2 border-transparent">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="h-24 w-full sm:w-24 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <BookOpen size={40} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{course.code}</span>
                    <span className="text-xs font-bold text-gray-400">{course.credits} Credits</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-brand-700 transition-colors">{course.name}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <User size={16} className="text-brand-400" />
                      {course.faculty}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <MapPin size={16} className="text-brand-400" />
                      {course.room}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium sm:col-span-2">
                      <Clock size={16} className="text-brand-400" />
                      {course.time}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <button className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">View Syllabus</button>
                <Button variant="ghost" size="sm">Course Content</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ShellLayout>
  );
}
