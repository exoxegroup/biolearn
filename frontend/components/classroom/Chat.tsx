
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from '../../types';
import { getChatHistory, sendChatMessage, getAIResponse } from '../../services/api';
import { Send, Bot } from 'lucide-react';
import { Spinner } from '../common/Spinner';

interface ChatProps {
  isAIAssistant: boolean;
  classId?: string;
  groupId?: number;
}

const Chat: React.FC<ChatProps> = ({ isAIAssistant, classId, groupId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!classId) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      // Allow anonymous access for now

      const response = await getChatHistory(classId, token || undefined, groupId);
      const chatHistory = response.messages || response;
      const formattedMessages: ChatMessage[] = chatHistory.map((msg: any) => ({
        id: msg.id,
        senderName: msg.sender?.name || 'Anonymous',
        senderId: msg.sender?.id || 'anonymous-student',
        text: msg.content || msg.text,
        isAI: msg.sender?.id === 'ai-assistant',
        timestamp: msg.timestamp,
      }));

      setMessages(formattedMessages);
      
      // Add AI intro message for AI assistant chat
      if (isAIAssistant && formattedMessages.length === 0) {
        setMessages([
          {
            id: 'ai-intro',
            senderName: 'BioLearn AI',
            senderId: 'ai-assistant',
            text: 'Hello! I\'m your AI assistant. Ask me questions about your studies or help with your group work.',
            isAI: true,
            timestamp: new Date().toISOString(),
          }
        ]);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [classId, groupId, isAIAssistant]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  useEffect(() => {
    if (!user || !classId) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      auth: { token: token || '' }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
      
      // Join appropriate room
      if (isAIAssistant) {
        newSocket.emit('join_room', { classId, groupId });
      } else if (groupId) {
        newSocket.emit('join_room', { classId, groupId });
      } else {
        newSocket.emit('join_room', { classId });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    newSocket.on('chat:message:received', (message: any) => {
      const newChatMessage: ChatMessage = {
        id: message.id,
        senderName: message.sender.name,
        senderId: message.sender.id,
        text: message.text,
        isAI: message.sender.id === 'ai-assistant',
        timestamp: message.timestamp,
      };
      setMessages(prev => [...prev, newChatMessage]);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to chat');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, classId, groupId, isAIAssistant]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !classId) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      if (isAIAssistant) {
        // For AI assistant, use the AI endpoint
        setAILoading(true);
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

        try {
          const aiResponse = await getAIResponse(newMessage, token || undefined, classId, groupId);
          const aiMessage: ChatMessage = {
            id: Date.now().toString() + '-ai',
            senderName: 'BioLearn AI',
            senderId: 'ai-assistant',
            text: aiResponse.response,
            isAI: true,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (aiError) {
          console.error('Error getting AI response:', aiError);
          setError('Failed to get AI response');
        } finally {
          setAILoading(false);
        }
      } else {
        // For group chat, use regular chat endpoint
        const messageData = await sendChatMessage(
          classId,
          newMessage,
          token || undefined,
          groupId
        );
        setNewMessage('');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-slate-500">
          {isAIAssistant ? 'Chat with BioLearn AI' : 'Group Chat'}
        </p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${
            msg.senderId === user?.id ? 'justify-end' : 'justify-start'
          }`}>
            {msg.isAI && (
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white flex-shrink-0">
                <Bot size={20}/>
              </div>
            )}
            <div className={`px-4 py-2 rounded-xl max-w-xs lg:max-w-md ${
              msg.senderId === user?.id 
                ? 'bg-teal-600 text-white' 
                : 'bg-slate-200 text-slate-800'
            }`}>
              {msg.senderId !== user?.id && !msg.isAI && (
                <p className="text-xs font-bold text-teal-700">{msg.senderName}</p>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {aiLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={20}/>
            </div>
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
        <button 
          type="submit" 
          className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 disabled:bg-teal-400" 
          disabled={!newMessage.trim() || aiLoading}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;