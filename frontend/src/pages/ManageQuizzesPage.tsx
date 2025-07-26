
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockGetClassDetails, mockUpdateQuiz, mockSetPosttestReuse } from '../../services/mockApi';
import { ClassDetails, Quiz } from '../../types';
import Header from '../../components/common/Header';
import { Spinner } from '../../components/common/Spinner';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import QuizEditor from '../../components/classroom/QuizEditor';

const ManageQuizzesPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usePretestQuestions, setUsePretestQuestions] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const details = await mockGetClassDetails(classId);
        if (details) {
          setClassDetails(details);
          setUsePretestQuestions(details.posttestUsesPretestQuestions);
        } else {
          setError('Class not found.');
        }
      } catch (err) {
        setError('Failed to load class details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [classId]);

  const handleSaveQuiz = async (quizType: 'pretest' | 'posttest', data: Quiz) => {
    if (!classId) return;
    try {
      const updatedQuiz = await mockUpdateQuiz(classId, quizType, data);
      setClassDetails(prev => {
        if (!prev) return null;
        return { ...prev, [quizType]: updatedQuiz };
      });
      // If teacher edits post-test manually, the "reuse" flag should be turned off
      if(quizType === 'posttest') {
          handleReuseToggle(false);
      }
      alert(`${quizType === 'pretest' ? 'Pre-test' : 'Post-test'} saved successfully!`);
    } catch (err) {
      alert(`Failed to save ${quizType}.`);
    }
  };

  const handleReuseToggle = async (checked: boolean) => {
      if (!classId) return;
      setUsePretestQuestions(checked);
      await mockSetPosttestReuse(classId, checked);
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  if (!classDetails) return null;

  const posttestData = usePretestQuestions 
    ? { ...classDetails.posttest, questions: classDetails.pretest.questions }
    : classDetails.posttest;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title={`Manage Quizzes: ${classDetails.name}`} />
      <main className="container mx-auto p-8">
        <Link to="/teacher-dashboard" className="flex items-center gap-2 text-teal-600 font-semibold mb-6 hover:underline">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuizEditor
            key={`pretest-${classDetails.id}`}
            editorTitle="Pre-Test Editor"
            quiz={classDetails.pretest}
            onSave={(data) => handleSaveQuiz('pretest', data)}
          />
          
          <div className="flex flex-col gap-4">
             <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Post-Test Editor</h3>
                <div className="flex items-center">
                    <input 
                        type="checkbox"
                        id="reuse-questions"
                        checked={usePretestQuestions}
                        onChange={(e) => handleReuseToggle(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="reuse-questions" className="ml-2 block text-sm font-medium text-slate-700">
                        Use same questions as Pre-test
                    </label>
                </div>
             </div>
             <QuizEditor
                key={`posttest-${classDetails.id}-${usePretestQuestions}`}
                editorTitle=""
                quiz={posttestData}
                onSave={(data) => handleSaveQuiz('posttest', data)}
                disabled={usePretestQuestions}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageQuizzesPage;
