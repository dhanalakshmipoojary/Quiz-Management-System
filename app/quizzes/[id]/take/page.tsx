'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  _id: string;
  questionText: string;
  type: 'mcq' | 'text' | 'true_false';
  marks: number;
  options?: string[];
  correctAnswer?: string | string[];
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  termsAndConditions?: string;
  totalMarks: number;
  questions: Question[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  async function loadQuiz() {
    try {
      const res = await fetch(`/api/public/quizzes/${quizId}`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        alert('Quiz not found');
        router.push('/');
      }
    } catch (err) {
      console.error('Error loading quiz:', err);
      alert('Error loading quiz');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  function handleStartQuiz() {
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }
    if (!acceptTerms) {
      alert('Please accept terms and conditions');
      return;
    }
    // Ensure a public user record exists for this email before starting the quiz
    (async () => {
      try {
        const res = await fetch('/api/public/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          // allow the user to continue even if creating the public user fails
          console.warn('Could not create/find public user');
        }
      } catch (err) {
        console.error('Public user create error', err);
      } finally {
        setShowQuiz(true);
      }
    })();
  }

  function handleAnswerChange(value: string) {
    const questionId = quiz!.questions[currentQuestion]._id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function handleNext() {
    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const submissionAnswers = quiz!.questions.map((q, idx) => ({
        questionIndex: idx,
        questionId: (q as any)._id ?? null,
        answer: answers[(q as any)._id] || '',
      }));

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          userEmail: email,
          answers: submissionAnswers,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        router.push(`/results/${result._id}`);
      } else {
        alert('Error submitting quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Quiz not found</p>
      </div>
    );
  }

  if (!showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.description}</p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{quiz.termsAndConditions || 'No terms and conditions provided.'}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">I accept the terms and conditions</span>
          </label>

          <button
            onClick={handleStartQuiz}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const answer = answers[question._id] || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-900">{quiz.title}</h2>
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {question.questionText}
            <span className="text-blue-600 ml-2">({question.marks} marks)</span>
          </h3>

          {question.type === 'mcq' && (
            <div className="mt-4 space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-blue-50">
                  <input
                    type="radio"
                    name={question._id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'true_false' && (
            <div className="mt-4 space-y-3">
              {['True', 'False'].map((option) => (
                <label key={option} className="flex items-center p-3 border border-gray-300 rounded cursor-pointer hover:bg-blue-50">
                  <input
                    type="radio"
                    name={question._id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full mt-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 bg-gray-500 text-white py-2 rounded font-medium hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
        </div>

        {/* Question Indicator */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded text-sm font-medium transition ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[quiz.questions[index]._id]
                    ? 'bg-green-200 text-gray-900'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
