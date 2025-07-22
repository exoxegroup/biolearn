import React, { useState, useEffect } from 'react';
import { ClassDetails, EnrolledStudent } from '../../types';
import { Users } from 'lucide-react';
import Chat from './Chat';
import SharedNotes from './SharedNotes';
import AIAssistant from './AIAssistant';

const GroupSessionView: React.FC<{ classDetails: ClassDetails; student: EnrolledStudent }> = ({ classDetails, student }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'ai'>('chat');
  
  if (!student.groupNumber) {
    return <div className="flex-grow flex items-center justify-center text-center p-8 bg-white rounded-lg shadow-md">
        <div>
            <h2 className="text-2xl font-bold text-slate-700">Waiting for Group Assignment</h2>
            <p className="text-slate-500 mt-2">Your teacher has not assigned you to a group yet. Please wait.</p>
        </div>
    </div>;
  }
  
  const groupMembers = classDetails.students.filter(s => s.groupNumber === student.groupNumber);

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Left Panel: Video & Group Info */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white">
          <p>Group {student.groupNumber} Video Feed</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md flex-grow">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Users size={24} className="text-teal-600" />
            Group {student.groupNumber} Members
          </h2>
          <div className="flex flex-wrap gap-4">
            {groupMembers.map(member => (
              <div key={member.id} className="bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
                {member.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Tabbed Interface for Chat, Notes, AI */}
      <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-200px)]">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 font-semibold ${activeTab === 'chat' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>Group Chat</button>
          <button onClick={() => setActiveTab('notes')} className={`flex-1 p-3 font-semibold ${activeTab === 'notes' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>Shared Notes</button>
          <button onClick={() => setActiveTab('ai')} className={`flex-1 p-3 font-semibold ${activeTab === 'ai' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>AI Assistant</button>
        </div>
        <div className="flex-grow flex flex-col overflow-hidden">
            {activeTab === 'chat' && <Chat isAIAssistant={false} key={`chat-${student.groupNumber}`} />}
            {activeTab === 'notes' && <SharedNotes classId={classDetails.id} groupId={student.groupNumber} key={`notes-${student.groupNumber}`} />}
            {activeTab === 'ai' && <AIAssistant key={`ai-${student.groupNumber}`} />}
        </div>
      </div>
    </div>
  );
};

export default GroupSessionView;