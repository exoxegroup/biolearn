
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockGetTeacherClasses, mockCreateClass } from '../services/mockApi';
import { ClassSummary } from '../types';
import Header from '../components/common/Header';
import { Spinner } from '../components/common/Spinner';
import { PlusCircle, Users, ClipboardCopy, Settings, ClipboardList, BarChart3 } from 'lucide-react';
import CreateClassModal from '../components/modals/CreateClassModal';

const ClassCard: React.FC<{ classInfo: ClassSummary }> = ({ classInfo }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(classInfo.classCode);
        alert(`Class code "${classInfo.classCode}" copied to clipboard!`);
    }

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{classInfo.name}</h3>
                    <div 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-mono cursor-pointer hover:bg-slate-200"
                    >
                        {classInfo.classCode}
                        <ClipboardCopy size={14} />
                    </div>
                </div>
                <div className="flex items-center text-slate-500 mt-4 gap-4">
                    <span className="flex items-center gap-2"><Users size={16} />{classInfo.studentCount} Students</span>
                </div>
            </div>
            <div className="bg-slate-50 p-4 flex flex-col gap-2">
                 <div className="grid grid-cols-2 gap-2">
                    <Link to={`/class/${classInfo.id}/manage`} className="text-center flex justify-center items-center gap-2 bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                        <Settings size={16} /> Content
                    </Link>
                    <Link to={`/class/${classInfo.id}/quizzes`} className="text-center flex justify-center items-center gap-2 bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                        <ClipboardList size={16} /> Quizzes
                    </Link>
                     <Link to={`/class/${classInfo.id}/students`} className="text-center flex justify-center items-center gap-2 bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                        <Users size={16} /> Students
                    </Link>
                    <Link to={`/class/${classInfo.id}/analytics`} className="text-center flex justify-center items-center gap-2 bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                        <BarChart3 size={16} /> Analytics
                    </Link>
                 </div>
                <Link to={`/classroom/${classInfo.id}`} className="w-full text-center block bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors mt-2">
                    Enter Classroom
                </Link>
            </div>
        </div>
    );
}

const TeacherDashboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClasses = async () => {
      if (user) {
        setLoading(true);
        const fetchedClasses = await mockGetTeacherClasses(user.id);
        setClasses(fetchedClasses);
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  const handleCreateClass = async (className: string) => {
    if (!user) return;
    const newClassSummary = await mockCreateClass(user.id, className);
    setClasses(prevClasses => [newClassSummary, ...prevClasses]);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title="Dashboard" />
      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Your Classes</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <PlusCircle size={20} />
            Create New Class
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center mt-16"><Spinner size="lg" /></div>
        ) : classes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map(c => <ClassCard key={c.id} classInfo={c} />)}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-slate-700">No classes yet!</h2>
            <p className="text-slate-500 mt-2">Click "Create New Class" to get started and set up your first lesson.</p>
          </div>
        )}
      </main>
      
      <CreateClassModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateClass}
      />
    </div>
  );
};

export default TeacherDashboard;
