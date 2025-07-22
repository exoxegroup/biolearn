
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from '../../types';
import { mockGetInitialChatMessages } from '../../services/mockApi';
import { Send, Bot } from 'lucide-react';
import { Spinner } from '../common/Spinner';

interface ChatProps {
  isAIAssistant: boolean;
  onNewAIMessage?: (prompt: string, history: any[]) => Promise<string>;
}

const Chat: React.FC<ChatProps> = ({ isAIAssistant, onNewAIMessage }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const initialMessages = await mockGetInitialChatMessages();
      if (isAIAssistant) {
        initialMessages.unshift({
          id: 'ai-intro',
          senderName: 'BioLearn AI',
          senderId: 'ai-assistant',
          text: 'Hello! I am BioLearn AI. How can I help you explore biology concepts today?',
          isAI: true,
          timestamp: new Date().toISOString(),
        });
      }
      setMessages(initialMessages);
      setLoading(false);
    };
    fetchMessages();
  }, [isAIAssistant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: user.name,
      senderId: user.id,
      text: newMessage,
      isAI: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    if (isAIAssistant && onNewAIMessage) {
        setAILoading(true);
        const aiResponseText = await onNewAIMessage(newMessage, []);
        const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            senderName: 'BioLearn AI',
            senderId: 'ai-assistant',
            text: aiResponseText,
            isAI: true,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setAILoading(false);
    }
    // In a non-AI chat, a socket event would be emitted here.
  };

  if (loading) {
    return <div className="flex-grow flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="flex-grow flex flex-col p-4 overflow-hidden">
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
            {msg.isAI && <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white flex-shrink-0"><Bot size={20}/></div>}
            <div className={`px-4 py-2 rounded-xl max-w-xs lg:max-w-md ${msg.senderId === user?.id ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {!msg.isAI && msg.senderId !== user?.id && <p className="text-xs font-bold text-teal-700">{msg.senderName}</p>}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {aiLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white flex-shrink-0"><Bot size={20}/></div>
                 <div className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800">
                    <Spinner size="sm" />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isAIAssistant ? "Ask the AI..." : "Type a message..."}
          className="flex-grow p-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button type="submit" className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400" disabled={!newMessage.trim() || aiLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;