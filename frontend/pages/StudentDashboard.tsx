
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockGetStudentClasses } from '../services/mockApi';
import { ClassSummary } from '../types';
import Header from '../components/common/Header';
import { Spinner } from '../components/common/Spinner';
import { LogIn, User } from 'lucide-react';

const ClassCard: React.FC<{ classInfo: ClassSummary }> = ({ classInfo }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        <div className="p-6 flex-grow">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{classInfo.name}</h3>
            <div className="flex items-center text-slate-500 mt-4 gap-4">
                <span className="flex items-center gap-2"><User size={16} />{classInfo.teacherName}</span>
            </div>
        </div>
        <div className="bg-slate-50 p-4">
            <Link to={`/classroom/${classInfo.id}`} className="w-full text-center block bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                Enter Classroom
            </Link>
        </div>
    </div>
);

const StudentDashboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [classCode, setClassCode] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchClasses = async () => {
      if (user) {
        setLoading(true);
        const fetchedClasses = await mockGetStudentClasses(user.id);
        setClasses(fetchedClasses);
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API endpoint to join the class.
    // The mock API handles joining when fetching class details.
    // For this UI, we just alert and rely on the user refreshing or the next fetch.
    alert(`Joining class with code: ${classCode}. If successful, it will appear in your list.`);
    setClassCode('');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title="Dashboard" />
      <main className="container mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-slate-800">Your Enrolled Classes</h1>
          <form onSubmit={handleJoinClass} className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="Enter Class Code"
              className="px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
            <button type="submit" className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
              <LogIn size={20} />
              Join
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center mt-16"><Spinner size="lg" /></div>
        ) : classes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map(c => <ClassCard key={c.id} classInfo={c} />)}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-slate-700">You're not enrolled in any classes.</h2>
            <p className="text-slate-500 mt-2">Enter a class code provided by your teacher to join a class.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;