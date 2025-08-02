
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
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Left Panel: Video & Materials */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white">
                    {/* Jitsi video feed would be embedded here */}
                    <p>Main Classroom Video Feed</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex-grow">
                    <h2 className="text-xl font-bold mb-4">Learning Materials</h2>
                    <div className="space-y-3">
                        {classDetails.materials.map(mat => <MaterialCard key={mat.id} material={mat} />)}
                    </div>
                </div>
            </div>

            {/* Right Panel: Students & Chat */}
            <div className="flex flex-col gap-4 h-[calc(100vh-200px)]">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-2">Participants ({classDetails.students.length})</h2>
                    <div className="max-h-48 overflow-y-auto">
                        {classDetails.students.map(s => <StudentListItem key={s.id} student={s} />)}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col">
                    <Chat isAIAssistant={false} classId={classDetails.id} />
                </div>
            </div>
        </div>
    );
};

export default MainSessionView;
