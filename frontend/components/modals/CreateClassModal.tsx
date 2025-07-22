
import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Spinner } from '../common/Spinner';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (className: string) => Promise<void>;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError('Class name cannot be empty.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCreate(className);
      setClassName(''); // Reset for next time
      onClose();
    } catch (err) {
      setError('Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-lg p-8 bg-white rounded-xl shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-red-600 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-teal-600 mb-2">Create a New Class</h2>
        <p className="text-slate-500 mb-6">Enter a name for your new class to get started.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="className" className="block text-sm font-medium text-slate-700">
              Class Name
            </label>
            <input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., Introduction to Photosynthesis"
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !className.trim()}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:bg-teal-400 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" color="text-white" /> : <PlusCircle size={16} />}
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
