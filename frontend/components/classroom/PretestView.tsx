
import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '../../types';

interface PretestViewProps {
  quiz: Quiz;
  onComplete: (answers: (number | null)[]) => void;
}

const PretestView: React.FC<PretestViewProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(answers);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete, answers]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleSubmit = () => {
    // In a real app, we would submit `answers` to the backend here.
    alert('Pre-test submitted! You will now enter the waiting room.');
    onComplete(answers);
  };

  const currentQuestion: QuizQuestion = quiz.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-8">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h1 className="text-3xl font-bold text-teal-600">{quiz.title}</h1>
          <div className="text-2xl font-mono bg-red-100 text-red-600 px-4 py-2 rounded-lg">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-slate-500 mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
          <h2 className="text-2xl font-semibold text-slate-800">{currentQuestion.text}</h2>
        </div>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`block w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                answers[currentQuestionIndex] === index
                  ? 'bg-teal-100 border-teal-500 ring-2 ring-teal-500'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-400'
              }`}
            >
              <span className="font-semibold">{option}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button onClick={handleNext} className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700">
              Next Question
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
              Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PretestView;
