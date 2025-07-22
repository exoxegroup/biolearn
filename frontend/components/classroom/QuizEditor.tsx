
import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '../../types';
import { PlusCircle, Trash2, Save, Clock } from 'lucide-react';
import { Spinner } from '../common/Spinner';

interface QuizEditorProps {
  quiz: Quiz;
  onSave: (updatedQuiz: Quiz) => Promise<void>;
  disabled?: boolean;
  editorTitle: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onSave, disabled = false, editorTitle }) => {
  const [localQuiz, setLocalQuiz] = useState<Quiz>(JSON.parse(JSON.stringify(quiz)));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalQuiz(JSON.parse(JSON.stringify(quiz)));
  }, [quiz]);
  
  const handleQuizMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalQuiz(prev => ({ ...prev, [name]: name === 'timeLimitMinutes' ? parseInt(value, 10) : value }));
  };

  const handleQuestionChange = (qIndex: number, text: string) => {
    const newQuestions = [...localQuiz.questions];
    newQuestions[qIndex].text = text;
    setLocalQuiz(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...localQuiz.questions];
    newQuestions[qIndex].options[oIndex] = text;
    setLocalQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    const newQuestions = [...localQuiz.questions];
    newQuestions[qIndex].correctAnswerIndex = oIndex;
    setLocalQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
        id: `q-${Date.now()}`,
        text: 'New Question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswerIndex: 0
    };
    setLocalQuiz(prev => ({ ...prev, questions: [...prev.questions, newQuestion]}));
  };

  const handleDeleteQuestion = (qIndex: number) => {
      if (window.confirm('Are you sure you want to delete this question?')) {
          const newQuestions = localQuiz.questions.filter((_, index) => index !== qIndex);
          setLocalQuiz(prev => ({ ...prev, questions: newQuestions }));
      }
  };
  
  const handleSaveChanges = async () => {
      setIsSaving(true);
      await onSave(localQuiz);
      setIsSaving(false);
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${disabled ? 'bg-slate-50' : ''}`}>
      {editorTitle && <h3 className="text-xl font-bold text-slate-800 mb-4">{editorTitle}</h3>}
      <div className={`space-y-4 ${disabled ? 'opacity-50' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor={`title-${localQuiz.id}`} className="block text-sm font-medium text-slate-700">Quiz Title</label>
              <input type="text" id={`title-${localQuiz.id}`} name="title" value={localQuiz.title} onChange={handleQuizMetaChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100" />
            </div>
            <div>
              <label htmlFor={`time-${localQuiz.id}`} className="block text-sm font-medium text-slate-700">Time (minutes)</label>
              <input type="number" id={`time-${localQuiz.id}`} name="timeLimitMinutes" value={localQuiz.timeLimitMinutes} onChange={handleQuizMetaChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100" />
            </div>
          </div>
        
          <div className="border-t pt-4 mt-4">
              <h4 className="text-lg font-semibold text-slate-700 mb-2">Questions ({localQuiz.questions.length})</h4>
              <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
                {localQuiz.questions.map((q, qIndex) => (
                    <div key={q.id} className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-slate-800">Question {qIndex + 1}</p>
                            <button onClick={() => handleDeleteQuestion(qIndex)} disabled={disabled} className="text-slate-400 hover:text-red-500 disabled:hover:text-slate-400">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <textarea value={q.text} onChange={e => handleQuestionChange(qIndex, e.target.value)} disabled={disabled} className="w-full p-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100" rows={2}/>
                        <div className="mt-2 space-y-2">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    <input type="radio" name={`correct-ans-${q.id}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleCorrectAnswerChange(qIndex, oIndex)} disabled={disabled} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300"/>
                                    <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} disabled={disabled} className={`flex-1 p-2 border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100 ${q.correctAnswerIndex === oIndex ? 'border-teal-500 font-semibold' : 'border-slate-300'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {localQuiz.questions.length === 0 && <p className="text-center text-slate-500 py-4">No questions yet. Add one below!</p>}
              </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <button onClick={handleAddQuestion} disabled={disabled} className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-800 disabled:text-slate-400">
                <PlusCircle size={18} /> Add Question
            </button>
            <button onClick={handleSaveChanges} disabled={disabled || isSaving} className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-teal-400">
                {isSaving ? <Spinner size="sm"/> : <Save size={16} />} Save Changes
            </button>
          </div>
      </div>
    </div>
  );
};

export default QuizEditor;
