
import React, { useState, useEffect } from 'react';
import { mockGetGroupNotes } from '../../services/mockApi';
import { Spinner } from '../common/Spinner';

interface SharedNotesProps {
  classId: string;
  groupId: number;
  readOnly?: boolean;
}

const SharedNotes: React.FC<SharedNotesProps> = ({ classId, groupId, readOnly = false }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mockGetGroupNotes(classId, groupId).then(content => {
      setNotes(content);
      setLoading(false);
    });
  }, [classId, groupId]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    // In a real app, this would emit a socket event with the new content
    // e.g., socket.emit('note:update', { classId, groupId, content: e.target.value });
  };

  if (loading) {
      return <div className="flex-grow flex items-center justify-center p-4"><Spinner /></div>
  }

  return (
    <div className="flex-grow flex flex-col p-4 h-full">
      {!readOnly && <p className="text-sm text-slate-500 mb-2">Your notes are saved automatically. All group members can see and edit them.</p>}
      <textarea
        value={notes}
        onChange={handleNotesChange}
        readOnly={readOnly}
        placeholder="Start typing your group's collaborative notes here..."
        className="w-full h-full flex-grow p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono bg-slate-50 disabled:bg-slate-100"
        disabled={readOnly}
      />
    </div>
  );
};

export default SharedNotes;
