
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStudentClasses, enrollInClass } from '../../services/api';
import { ClassSummary } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
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
      const token = localStorage.getItem('authToken');
      if (user && token) {
        setLoading(true);
        try {
          const fetchedClasses = await getStudentClasses(token);
          setClasses(fetchedClasses);
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchClasses();
  }, [user]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token || !classCode) return;
    try {
      await enrollInClass(classCode, token);
      // Refresh classes
      const fetchedClasses = await getStudentClasses(token);
      setClasses(fetchedClasses);
      alert('Successfully joined the class!');
    } catch (error) {
      alert('Failed to join class. Please check the code and try again.');
    }
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