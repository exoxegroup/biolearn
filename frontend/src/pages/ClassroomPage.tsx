import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getClassDetails, submitPretest } from '../../services/api';
import { ClassDetails, ClassroomStatus, EnrolledStudent } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { Play, Square, Users, Redo } from 'lucide-react';

// Sub-components for different classroom views
import PretestView from '../../components/classroom/PretestView';
import PosttestView from '../../components/classroom/PosttestView';
import MainSessionView from '../../components/classroom/MainSessionView';
import GroupSessionView from '../../components/classroom/GroupSessionView';
import TeacherGroupMonitorView from '../../components/classroom/TeacherGroupMonitorView';


const ClassroomPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classStatus, setClassStatus] = useState<ClassroomStatus>('WAITING_ROOM');
  const [student, setStudent] = useState<EnrolledStudent | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId || !user) {
        setError('Invalid class or user.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const details = await getClassDetails(classId, token);
          setClassDetails(details);
          if (user.role === 'STUDENT') {
            const currentStudent = details.students.find((s: EnrolledStudent) => s.id === user.id);
            setStudent(currentStudent || null);
            // If pre-test not taken, force pre-test view
            if (currentStudent?.pretestStatus === 'NOT_TAKEN') {
              setClassStatus('PRETEST');
            } else {
              // Otherwise, follow the class status from the backend
              setClassStatus(details.status || 'WAITING_ROOM');
            }
          } else {
             setClassStatus(details.status || 'WAITING_ROOM');
          }
        } catch (error) {
          console.error('Failed to fetch class details:', error);
          setError('Failed to load class details.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Authentication required.');
        setLoading(false);
      }
    };
    fetchClassDetails();
    // Polling/sockets will be added in Phase 6 for real-time updates.
  }, [classId, user]);

  const handlePretestComplete = async (answers: (number | null)[]) => {
    const token = localStorage.getItem('authToken');
    if (token && classId) {
      try {
        await submitPretest(classId, answers, token);
        // Refetch class details to update status and move to waiting room
        const updatedDetails = await getClassDetails(classId, token);
        setClassDetails(updatedDetails);
        setClassStatus('WAITING_ROOM');
      } catch (error) {
        console.error('Failed to submit pretest:', error);
        setError('Failed to submit pretest. Please try again.');
      }
    }
  };

  // This function simulates real-time state changes.
  // In Phase 6, this will be replaced with Socket.io events.
  const handleTeacherControl = (newStatus: ClassroomStatus) => {
    console.log(`Teacher action: Set status to ${newStatus}`);
    // This is a placeholder for emitting a socket event to the backend.
    // For now, it just updates the local state to demonstrate UI changes.
    setClassStatus(newStatus);
  };

  const TeacherControls: React.FC = () => (
    <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
      <p className="font-semibold text-slate-700 mr-2">Class Control:</p>
      <button onClick={() => handleTeacherControl('MAIN_SESSION')} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"><Play size={16}/> Start Class</button>
      <button onClick={() => handleTeacherControl('GROUP_SESSION')} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Users size={16}/> Activate Groups</button>
      <button onClick={() => handleTeacherControl('MAIN_SESSION')} className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"><Redo size={16}/> End Groups</button>
      <button onClick={() => handleTeacherControl('POSTTEST')} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"><Square size={16}/> End Class</button>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex-grow flex items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return <div className="flex-grow flex items-center justify-center text-red-500">{error}</div>;
    if (!classDetails) return <div className="flex-grow flex items-center justify-center">Class data is unavailable.</div>;

    // Student View
    if (user?.role === 'STUDENT') {
      switch (classStatus) {
        case 'PRETEST':
          return <PretestView quiz={classDetails.pretest} onComplete={handlePretestComplete} />;
        case 'WAITING_ROOM':
          return <div className="text-center p-8">
            <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
            <p className="text-slate-600 mt-2">The class will begin shortly. Please wait for the teacher to start.</p>
          </div>;
        case 'MAIN_SESSION':
          return <MainSessionView classDetails={classDetails} />;
        case 'GROUP_SESSION':
          return <GroupSessionView classDetails={classDetails} student={student!} />;
        case 'POSTTEST':
          return <PosttestView quiz={classDetails.posttest} onComplete={() => setClassStatus('ENDED')} />;
        case 'ENDED':
            return <div className="text-center p-8">
                <h2 className="text-3xl font-bold">Class has ended.</h2>
                <p className="text-slate-600 mt-2">You have completed the post-test. You can view your scores on your dashboard.</p>
            </div>;
        default:
          return <div>Unknown class state.</div>;
      }
    }

    // Teacher View
    if (user?.role === 'TEACHER') {
      switch(classStatus) {
        case 'GROUP_SESSION':
            return <TeacherGroupMonitorView classDetails={classDetails} />;
        default: // Covers WAITING, MAIN_SESSION, POSTTEST, ENDED
            return <MainSessionView classDetails={classDetails} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header title={classDetails?.name || 'Classroom'} />
      {user?.role === 'TEACHER' && <div className="container mx-auto p-4 flex justify-end"><TeacherControls /></div>}
      <main className="container mx-auto p-4 pt-0 flex-grow flex flex-col">
          {renderContent()}
      </main>
    </div>
  );
};

export default ClassroomPage;