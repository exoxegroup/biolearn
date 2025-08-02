import React, { useState } from 'react';
import { ClassDetails } from '../../types';
import Chat from './Chat';
import SharedNotes from './SharedNotes';

const TeacherGroupMonitorView: React.FC<{ classDetails: ClassDetails }> = ({ classDetails }) => {
  const groups = [...new Set(classDetails.students.map(s => s.groupNumber).filter(g => g !== null && g !== undefined))].sort((a,b) => a! - b!);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(groups[0] || null);

  if (selectedGroup === null) {
    return <div className="flex-grow flex items-center justify-center text-center p-8 bg-white rounded-lg shadow-md">
        <div>
            <h2 className="text-2xl font-bold text-slate-700">No Active Groups</h2>
            <p className="text-slate-500 mt-2">Students have not been assigned to groups, or groups have not been activated.</p>
        </div>
    </div>;
  }

  return (
    <div className="flex-grow flex flex-col gap-4">
        <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
            <h2 className="text-xl font-bold mr-4">Monitor Groups</h2>
            <div className="flex flex-wrap gap-2">
                {groups.map(g => (
                    <button 
                        key={g} 
                        onClick={() => setSelectedGroup(g)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            selectedGroup === g ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        Group {g}
                    </button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow h-[calc(100vh-270px)]">
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white">
                    <p>Observing Group {selectedGroup} Video Feed</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md flex-grow flex flex-col">
                     <h3 className="text-lg font-bold mb-2">Shared Notes for Group {selectedGroup}</h3>
                     <SharedNotes classId={classDetails.id} groupId={selectedGroup} readOnly={true} key={`notes-monitor-${selectedGroup}`} />
                 </div>
            </div>
            <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col">
                <h3 className="p-4 border-b font-bold text-lg">Group {selectedGroup} Chat</h3>
                <Chat isAIAssistant={false} key={`chat-monitor-${selectedGroup}`} classId={classDetails.id} groupId={selectedGroup} />
            </div>
        </div>
    </div>
  );
};

export default TeacherGroupMonitorView;