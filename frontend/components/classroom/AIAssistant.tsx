
import React from 'react';
import Chat from './Chat';
import { getAIResponse } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const AIAssistant: React.FC = () => {

  const handleNewMessage = async (prompt: string, history: ChatMessage[]) => {
    // The history part is not fully implemented in this version for simplicity,
    // but the structure is here. The prompt to Gemini is self-contained.
    const geminiHistory = history.map(msg => ({
        role: msg.isAI ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
    return getAIResponse(prompt, geminiHistory);
  };

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-center">AI Assistant</h3>
        <p className="text-sm text-center text-slate-500">Ask questions, brainstorm, or explore topics.</p>
      </div>
      <Chat isAIAssistant={true} onNewAIMessage={handleNewMessage} />
    </div>
  );
};

export default AIAssistant;
