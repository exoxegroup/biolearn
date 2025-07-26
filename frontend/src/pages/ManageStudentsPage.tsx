
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockGetClassDetails, mockAssignStudentsToGroups } from '../../services/mockApi';
import { ClassDetails, EnrolledStudent } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { ArrowLeft, Users, Save, Wand2 } from 'lucide-react';

const ManageStudentsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoGroupCount, setAutoGroupCount] = useState(2);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const details = await mockGetClassDetails(classId);
        if (details) {
          setClassDetails(details);
          setStudents(details.students);
        } else {
          setError('Class not found.');
        }
      } catch (err) {
        setError('Failed to load class details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [classId]);

  const handleGroupChange = (studentId: string, groupNumberStr: string) => {
    const groupNumber = groupNumberStr === '' ? null : parseInt(groupNumberStr, 10);
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, groupNumber: isNaN(groupNumber!) ? null : groupNumber } : s))
    );
  };
  
  const handleAutoAssign = () => {
      if(autoGroupCount <= 0) {
          alert("Number of groups must be greater than zero.");
          return;
      }

      const unassignedStudents = students.filter(s => s.groupNumber === null);
      if(unassignedStudents.length === 0) {
          alert("All students are already assigned to a group.");
          return;
      }

      // Shuffle the unassigned students for randomness
      const shuffled = [...unassignedStudents].sort(() => Math.random() - 0.5);

      const updatedStudents = [...students];

      shuffled.forEach((student, index) => {
          const groupNum = (index % autoGroupCount) + 1;
          const studentIndexInMainList = updatedStudents.findIndex(s => s.id === student.id);
          if (studentIndexInMainList !== -1) {
              updatedStudents[studentIndexInMainList].groupNumber = groupNum;
          }
      });
      
      setStudents(updatedStudents);
  };

  const handleSaveChanges = async () => {
    if (!classId) return;
    setIsSaving(true);
    try {
      const assignments = students.map(s => ({ studentId: s.id, groupNumber: s.groupNumber }));
      await mockAssignStudentsToGroups(classId, assignments);
      alert('Group assignments saved successfully!');
    } catch (err) {
      alert('Failed to save group assignments.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title={`Manage Students: ${classDetails?.name}`} />
      <main className="container mx-auto p-8">
        <Link to="/teacher-dashboard" className="flex items-center gap-2 text-teal-600 font-semibold mb-6 hover:underline">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-4 mb-4">
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Users size={28}/> Enrolled Students ({students.length})
                </h2>
                <div className="flex items-center gap-2">
                    <input 
                        type="number"
                        min="1"
                        value={autoGroupCount}
                        onChange={e => setAutoGroupCount(parseInt(e.target.value, 10) || 1)}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button 
                        onClick={handleAutoAssign}
                        className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                       <Wand2 size={16}/> Auto-Assign Groups
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {students.map(student => (
                    <div key={student.id} className="grid grid-cols-3 items-center bg-slate-50 p-3 rounded-lg hover:bg-slate-100">
                        <span className="col-span-2 font-medium text-slate-800">{student.name}</span>
                        <div className="flex items-center gap-2">
                            <label htmlFor={`group-${student.id}`} className="text-sm font-semibold text-slate-600">Group:</label>
                            <input
                                id={`group-${student.id}`}
                                type="number"
                                value={student.groupNumber ?? ''}
                                onChange={e => handleGroupChange(student.id, e.target.value)}
                                placeholder="N/A"
                                min="1"
                                className="w-20 px-2 py-1 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 border-t pt-6 flex justify-end">
                <button 
                    onClick={handleSaveChanges} 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:bg-teal-400"
                >
                    {isSaving ? <Spinner size="sm"/> : <Save size={18}/>}
                    Save Group Assignments
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ManageStudentsPage;
