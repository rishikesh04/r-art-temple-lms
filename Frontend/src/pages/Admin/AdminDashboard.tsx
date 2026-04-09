import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

// This interface tells TypeScript exactly what shape of data we expect from the backend
interface DashboardData {
  stats: {
    totalStudents: number;
    approvedStudents: number;
    pendingStudents: number;
    totalTests: number;
    totalAttempts: number;
  };
  recentStudents: Array<{
    id: string;
    name: string;
    email: string;
    classLevel: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // When the page loads, fetch the dashboard data from your backend!
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/admin/dashboard');
        setData(response.data.data); // Your backend sends { success: true, data: { ... } }
      } catch (err) {
        setError('Failed to load dashboard data. Are you sure you are an admin?');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <div className="p-10 font-bold text-2xl uppercase animate-pulse">Loading System Data...</div>;
  }

  if (error || !data) {
    return <div className="p-10 font-bold text-2xl text-red-600 bg-red-100 border-4 border-brand-black shadow-solid max-w-2xl mx-auto mt-10">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">Command Center</h1>
        <p className="text-brand-black/70 font-medium text-lg">System overview and recent activity.</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Stat Card 1 */}
        <div className="bg-white border-4 border-brand-black p-6 shadow-solid hover:-translate-y-1 hover:shadow-solid-hover transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg uppercase text-brand-black/70">Total Students</h3>
            <Users size={28} className="text-brand-orange" />
          </div>
          <p className="text-5xl font-black">{data.stats.totalStudents}</p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border-4 border-brand-black p-6 shadow-solid hover:-translate-y-1 hover:shadow-solid-hover transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg uppercase text-brand-black/70">Pending Approval</h3>
            <Clock size={28} className="text-brand-orange" />
          </div>
          <p className="text-5xl font-black">{data.stats.pendingStudents}</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white border-4 border-brand-black p-6 shadow-solid hover:-translate-y-1 hover:shadow-solid-hover transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg uppercase text-brand-black/70">Active Tests</h3>
            <BookOpen size={28} className="text-brand-orange" />
          </div>
          <p className="text-5xl font-black">{data.stats.totalTests}</p>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white border-4 border-brand-black p-6 shadow-solid hover:-translate-y-1 hover:shadow-solid-hover transition-all">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg uppercase text-brand-black/70">Total Attempts</h3>
            <CheckCircle size={28} className="text-brand-orange" />
          </div>
          <p className="text-5xl font-black">{data.stats.totalAttempts}</p>
        </div>
      </div>

      {/* --- RECENT STUDENTS TABLE --- */}
      <div className="bg-white border-4 border-brand-black shadow-solid overflow-hidden">
        <div className="bg-brand-black text-white p-4 border-b-4 border-brand-black">
          <h2 className="text-xl font-bold uppercase tracking-wider">Recent Registrations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-gray/20 text-sm uppercase tracking-wider border-b-2 border-brand-black">
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold hidden md:table-cell">Email</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentStudents.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center font-bold text-brand-black/50">No students found.</td></tr>
              ) : (
                data.recentStudents.map((student, index) => (
                  <tr key={student.id} className={index !== data.recentStudents.length - 1 ? "border-b-2 border-brand-black/20 hover:bg-brand-gray/10" : "hover:bg-brand-gray/10"}>
                    <td className="p-4 font-bold">{student.name}</td>
                    <td className="p-4 hidden md:table-cell">{student.email}</td>
                    <td className="p-4 font-bold text-brand-orange">Class {student.classLevel}</td>
                    <td className="p-4">
                      {/* Dynamic Status Badge */}
                      <span className={`px-3 py-1 text-xs font-bold uppercase border-2 border-brand-black shadow-solid-sm
                        ${student.status === 'approved' ? 'bg-green-400' : 
                          student.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}