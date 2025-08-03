import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => Promise<void>;
  currentName: string;
  isLoading?: boolean;
}

const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
  isLoading = false,
}) => {
  const [className, setClassName] = useState(currentName);
  const [error, setError] = useState('');

  useEffect(() => {
    setClassName(currentName);
    setError('');
  }, [currentName, isOpen]);

  const handleSave = async () => {
    if (!className.trim()) {
      setError('Class name is required');
      return;
    }

    if (className.trim() === currentName.trim()) {
      onClose();
      return;
    }

    try {
      await onSave(className.trim());
      onClose();
    } catch (err) {
      setError('Failed to update class name. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Edit3 size={20} className="text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">Edit Class Name</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-slate-700 mb-2">
                Class Name
              </label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter class name"
                maxLength={100}
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t bg-slate-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !className.trim() || className.trim() === currentName.trim()}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;