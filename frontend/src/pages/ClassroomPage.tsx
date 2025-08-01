import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import { getClassDetails, submitPretest, getQuiz, submitQuiz } from '../../services/api';
import { ClassDetails, ClassroomStatus, EnrolledStudent, Quiz } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { Play, Square, Users, Redo } from 'lucide-react';
import JitsiVideo from '../../components/classroom/JitsiVideo';

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
  const [pretestQuiz, setPretestQuiz] = useState<Quiz | null>(null);
  const [posttestQuiz, setPosttestQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classStatus, setClassStatus] = useState<ClassroomStatus>('WAITING_ROOM');
  const [student, setStudent] = useState<EnrolledStudent | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
          const [details, pretest, posttest] = await Promise.all([
            getClassDetails(classId, token),
            getQuiz(classId, 'PRETEST', token),
            getQuiz(classId, 'POSTTEST', token)
          ]);
          
          setClassDetails(details);
          setPretestQuiz(pretest);
          setPosttestQuiz(posttest);
          
          if (user && user.role === 'STUDENT') {
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

  // Socket.io connection and event handling
  useEffect(() => {
    if (!classId || !user) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required.');
      return;
    }

    // Initialize socket connection
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    const newSocket = io(backendUrl, {
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to classroom socket');
      // Join the class room
      newSocket.emit('join_room', { classId, userId: user?.id });
    });

    newSocket.on('class:state-changed', (data: { status: ClassroomStatus; message: string }) => {
      console.log('Class state changed:', data);
      setClassStatus(data.status);
    });

    newSocket.on('teacher:error', (data: { error: string }) => {
      console.error('Teacher action error:', data.error);
      setError(data.error);
    });

    newSocket.on('users:online', (data: { onlineUsers: string[] }) => {
      setOnlineUsers(data.onlineUsers);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [classId, user]);

  const handlePretestComplete = async (answers: (number | null)[]) => {
    const token = localStorage.getItem('authToken');
    if (token && classId) {
      try {
        // Filter out null answers and convert to numbers
        const validAnswers = answers.filter(answer => answer !== null) as number[];
        await submitQuiz(classId, validAnswers, 'PRETEST', token);
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

  const handlePosttestComplete = async (answers: (number | null)[]) => {
    const token = localStorage.getItem('authToken');
    if (token && classId) {
      try {
        // Filter out null answers and convert to numbers
        const validAnswers = answers.filter(answer => answer !== null) as number[];
        await submitQuiz(classId, validAnswers, 'POSTTEST', token);
        setClassStatus('ENDED');
      } catch (error) {
        console.error('Failed to submit posttest:', error);
        setError('Failed to submit posttest. Please try again.');
      }
    }
  };

  // Handle teacher controls with Socket.io
  const handleTeacherControl = (newStatus: ClassroomStatus) => {
    if (!socket || !classId || !user || user.role !== 'TEACHER') {
      console.error('Socket not available or user is not a teacher');
      return;
    }

    console.log(`Teacher action: Set status to ${newStatus}`);
    
    switch (newStatus) {
      case 'MAIN_SESSION':
        socket.emit('teacher:start-class', { classId });
        break;
      case 'GROUP_SESSION':
        socket.emit('teacher:activate-groups', { classId });
        break;
      case 'POSTTEST':
        socket.emit('teacher:end-class', { classId });
        break;
      default:
        console.error('Invalid status for teacher control:', newStatus);
    }
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
    if (user && user.role === 'STUDENT') {
      switch (classStatus) {
        case 'PRETEST':
          return pretestQuiz ? 
            <PretestView quiz={pretestQuiz} onComplete={handlePretestComplete} /> : 
            <div className="text-center p-8">
              <h2 className="text-3xl font-bold">Pre-test not available</h2>
              <p className="text-slate-600 mt-2">Please contact your teacher.</p>
            </div>;
        case 'WAITING_ROOM':
          return <div className="text-center p-8">
            <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
            <p className="text-slate-600 mt-2">The class will begin shortly. Please wait for the teacher to start.</p>
          </div>;
        case 'MAIN_SESSION':
          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Main Session</h2>
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showVideo ? 'Hide Video' : 'Show Video'}
                </button>
              </div>
              <p className="text-slate-600">Welcome to the main session. The teacher will guide you through the lesson.</p>
              
              {showVideo && (
                <div className="bg-slate-900 rounded-lg overflow-hidden">
                  <JitsiVideo
                    roomName={`bioclass-${classId}`}
                    displayName={user?.name || 'Anonymous'}
                    isTeacher={user?.role === 'TEACHER'}
                  />
                </div>
              )}
              
              <div className="bg-slate-100 rounded-lg p-8 text-center">
                <p className="text-slate-500">Main session content will appear here</p>
              </div>
            </div>
          );
        case 'GROUP_SESSION':
          return <GroupSessionView classDetails={classDetails} student={student!} />;
        case 'POSTTEST':
          return posttestQuiz ? 
            <PosttestView quiz={posttestQuiz} onComplete={handlePosttestComplete} /> : 
            <div className="text-center p-8">
              <h2 className="text-3xl font-bold">Post-test not available</h2>
              <p className="text-slate-600 mt-2">Please contact your teacher.</p>
            </div>;
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
    if (user && user.role === 'TEACHER') {
      switch(classStatus) {
        case 'GROUP_SESSION':
            return <TeacherGroupMonitorView classDetails={classDetails} />;
        default: // Covers WAITING, MAIN_SESSION, POSTTEST, ENDED
            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">Main Session</h2>
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showVideo ? 'Hide Video' : 'Show Video'}
                  </button>
                </div>
                <p className="text-slate-600">Welcome to the main session. You are now in control of the lesson.</p>
                
                {showVideo && (
                  <div className="bg-slate-900 rounded-lg overflow-hidden">
                    <JitsiVideo
                      roomName={`bioclass-${classId}`}
                      displayName={user?.name || 'Teacher'}
                      isTeacher={true}
                    />
                  </div>
                )}
                
                <div className="bg-slate-100 rounded-lg p-8 text-center">
                  <p className="text-slate-500">Main session content will appear here</p>
                </div>
              </div>
            );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header title={classDetails?.name || 'Classroom'} />
      {user && user.role === 'TEACHER' && 
        <div className="container mx-auto p-4 flex justify-end items-center">
          <div className="flex items-center space-x-2 text-slate-600 mr-4">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length} online</span>
          </div>
          <TeacherControls />
        </div>
      }
      <main className="container mx-auto p-4 pt-0 flex-grow flex flex-col">
          {renderContent()}
      </main>
    </div>
  );
};

export default ClassroomPage;