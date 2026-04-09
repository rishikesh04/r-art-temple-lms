import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  classLevel: string;
  status: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab]);

  const fetchStudents = async (tab: 'pending' | 'all') => {
    setIsLoading(true);
    try {
      const endpoint = tab === 'pending' ? '/admin/students/pending' : '/admin/students';
      const res = await axiosInstance.get(endpoint);
      
      // Let's print exactly what the backend sent us to the browser console!
      console.log("BACKEND RESPONSE:", res.data);

      // SAFE EXTRACTION:
      //  check multiple common backend response shapes to find the array of students.
      // If it can't find an array, it safely defaults to an empty array [] so the app never crashes.
      const studentData = 
        res.data.data ||       // Try { success: true, data: [...] }
        res.data.students ||   // Try { count: X, students: [...] }
        res.data;              // Try just returning an array [...]

      // Ensure it is ACTUALLY an array before setting it
      if (Array.isArray(studentData)) {
        setStudents(studentData);
      } else {
        console.error("Backend did not return an array of students. It returned:", studentData);
        setStudents([]); // Safe default
      }

    } catch (error) {
      console.error('Failed to fetch students', error);
      setStudents([]); // Safe default if the request fails completely
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      // Call the backend API you built!
      await axiosInstance.patch(`/admin/students/${id}/${action}`);
      
      // UI Magic: Remove the student from the screen instantly without reloading the page
      if (activeTab === 'pending') {
        setStudents(prev => prev.filter(s => s._id !== id));
      } else {
        fetchStudents('all'); // Refresh if on 'all' tab to update their status badge
      }
    } catch (error) {
      alert(`Failed to ${action} student. Check console.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Access Control</h1>
          <p className="text-brand-black/70 font-medium">Manage student registrations and platform access.</p>
        </div>

        {/* Brutalist Tabs */}
        <div className="flex bg-white border-4 border-brand-black shadow-solid-sm w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-bold uppercase text-sm border-r-4 border-brand-black transition-colors ${activeTab === 'pending' ? 'bg-brand-orange text-brand-black' : 'hover:bg-brand-gray/20'}`}
          >
            Pending Requests
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-bold uppercase text-sm transition-colors ${activeTab === 'all' ? 'bg-brand-black text-white' : 'hover:bg-brand-gray/20'}`}
          >
            All Students
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-40 flex items-center justify-center border-4 border-brand-black border-dashed opacity-50 font-bold uppercase animate-pulse">Scanning Database...</div>
      ) : students.length === 0 ? (
        <div className="w-full p-12 text-center border-4 border-brand-black bg-white shadow-solid">
          <h2 className="text-2xl font-black uppercase text-brand-black/40">No {activeTab} students found.</h2>
        </div>
      ) : (
        /* Mobile-First Grid: 1 column on phones, 2 on tablets, 3 on desktop */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={student._id} 
              className="bg-white border-4 border-brand-black p-6 shadow-solid flex flex-col relative"
            >
              {/* Status Badge */}
              <div className={`absolute -top-4 -right-4 px-3 py-1 font-bold text-xs uppercase border-2 border-brand-black shadow-solid-sm rotate-3 ${student.status === 'approved' ? 'bg-green-400' : student.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}>
                {student.status}
              </div>

              <h3 className="text-2xl font-black uppercase truncate" title={student.name}>{student.name}</h3>
              <p className="font-bold text-brand-orange mb-4 uppercase text-sm">Class {student.classLevel}</p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-brand-black/70 mb-1 truncate">
                <Mail size={16} className="shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-brand-black/70 mb-6">
                <Phone size={16} className="shrink-0" />
                <span>{student.phone}</span>
              </div>

              {/* Action Buttons (Only show on Pending tab) */}
              {activeTab === 'pending' && (
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t-2 border-brand-black/10">
                  <button 
                    onClick={() => handleAction(student._id, 'approve')}
                    className="flex items-center justify-center gap-2 bg-green-400 border-2 border-brand-black py-2 font-bold uppercase text-xs shadow-solid-sm hover:-translate-y-1 hover:shadow-solid active:translate-y-0 active:shadow-none transition-all"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(student._id, 'reject')}
                    className="flex items-center justify-center gap-2 bg-red-400 border-2 border-brand-black py-2 font-bold uppercase text-xs shadow-solid-sm hover:-translate-y-1 hover:shadow-solid active:translate-y-0 active:shadow-none transition-all"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}