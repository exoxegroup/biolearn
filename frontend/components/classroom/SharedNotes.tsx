
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getGroupNotes, updateGroupNotes } from '../../services/api';
import { Spinner } from '../common/Spinner';

interface SharedNotesProps {
  classId: string;
  groupId: number;
  readOnly?: boolean;
}

const SharedNotes: React.FC<SharedNotesProps> = ({ classId, groupId, readOnly = false }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await getGroupNotes(classId, groupId, token);
      setNotes(response.content || '');
    } catch (err) {
      setError('Failed to load notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [classId, groupId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required');
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
      setIsConnected(true);
      console.log('Connected to server');
      
      // Join the group room for notes
      newSocket.emit('join:group', { classId, groupId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('note:updated', (data: { content: string }) => {
      setNotes(data.content);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [classId, groupId]);

  const saveNotes = useCallback(async (content: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      setSaving(true);
      await updateGroupNotes(classId, groupId, content, token);
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('note:update', { classId, groupId, content });
      }
      
    } catch (err) {
      setError('Failed to save notes');
      console.error('Error saving notes:', err);
    } finally {
      setSaving(false);
    }
  }, [classId, groupId, socket]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNotes(newContent);
    
    if (readOnly) return;
    
    // Debounce the save operation
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(newContent);
    }, 1000);
  }, [readOnly, saveNotes]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col p-4 h-full">
      {!readOnly && (
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-slate-500">
            Your notes are saved automatically. All group members can see and edit them.
          </p>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs text-slate-500">Saving...</span>
            )}
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} title={isConnected ? 'Connected' : 'Disconnected'} />
          </div>
        </div>
      )}
      <textarea
        value={notes}
        onChange={handleNotesChange}
        readOnly={readOnly}
        placeholder={readOnly ? 'No notes available' : 'Start typing your group\'s collaborative notes here...'}
        className="w-full h-full flex-grow p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
        disabled={readOnly}
      />
    </div>
  );
};

export default SharedNotes;
