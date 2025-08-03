
import React from 'react';
import { ClassDetails, EnrolledStudent, Material, User } from '../../types';
import { FileText, Youtube, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Chat from './Chat';

const MaterialCard: React.FC<{ material: Material }> = ({ material }) => {
    const Icon = material.type === 'pdf' ? FileText : material.type === 'docx' ? FileText : Youtube;
    const color = material.type === 'pdf' ? 'text-red-500' : material.type === 'docx' ? 'text-blue-500' : 'text-red-700';
    return (
        <a href={material.url} target="_blank" rel="noopener noreferrer" className="bg-slate-50 p-4 rounded-lg flex items-center gap-4 hover:bg-slate-100 transition-colors">
            <Icon size={24} className={color} />
            <span className="font-medium text-slate-700">{material.title}</span>
        </a>
    )
};

const StudentListItem: React.FC<{ student: EnrolledStudent }> = ({ student }) => (
    <div className="flex justify-between items-center p-3 hover:bg-slate-100 rounded-lg">
        <span className="font-medium">{student.name}</span>
        {student.pretestStatus === 'TAKEN' ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full"><CheckCircle size={12}/> Taken</span>
        ) : (
            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full"><Clock size={12}/> Pending</span>
        )}
    </div>
)

const MainSessionView: React.FC<{ classDetails: ClassDetails }> = ({ classDetails }) => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'TEACHER';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 min-h-screen">
            {/* Left Panel: Video & Materials */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Live Video</h3>
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white">
                        {/* Jitsi video feed would be embedded here */}
                        <p>Main Classroom Video Feed</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Class Materials</h3>
                    <div className="space-y-2">
                        {classDetails.materials?.map((material: any) => (
                            <div key={material.id} className="p-3 bg-slate-50 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">{material.title}</span>
                                    <a 
                                        href={material.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle Panel: Participants */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Participants ({classDetails.students.length + 1})</h3>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {classDetails.teacher.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">{classDetails.teacher.name}</p>
                                <p className="text-xs text-slate-500">Teacher</p>
                            </div>
                        </div>
                        {classDetails.students.map(s => <StudentListItem key={s.id} student={s} />)}
                    </div>
                </div>
            </div>

            {/* Right Panel: Main Classroom Chat */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-[400px]">
                <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col h-full">
                    <div className="p-3 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Main Classroom Chat</h3>
                        <p className="text-sm text-slate-500">All students and teacher</p>
                    </div>
                    <div className="flex-grow overflow-hidden h-full">
                        <Chat isAIAssistant={false} classId={classDetails.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainSessionView;
