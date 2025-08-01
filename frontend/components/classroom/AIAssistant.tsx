
import React from 'react';
import Chat from './Chat';

interface AIAssistantProps {
  classId?: string;
  groupId?: number;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ classId, groupId }) => {
  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-center">AI Assistant</h3>
        <p className="text-sm text-center text-slate-500">Ask questions, brainstorm, or explore topics.</p>
      </div>
      <Chat isAIAssistant={true} classId={classId} groupId={groupId} />
    </div>
  );
};

export default AIAssistant;
