'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  _id: string;
  questionText: string;
  marks: number;
}

interface Answer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marks: number;
}

interface Submission {
  _id: string;
  userEmail: string;
  score: number;
  totalMarks: number;
  answers: Answer[];
  questions: Question[];
  submittedAt: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [submissionId]);

  async function loadResults() {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`);
      if (res.ok) {
        const data = await res.json();
        setSubmission(data);
      } else {
        alert('Results not found');
        router.push('/');
      }
    } catch (err) {
      console.error('Error loading results:', err);
      alert('Error loading results');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Results not found</p>
      </div>
    );
  }

  const percentage = Math.round((submission.score / submission.totalMarks) * 100);
  const isPassed = percentage >= 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className={`rounded-lg shadow-lg p-8 mb-6 text-center ${
          isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h1 className={`text-4xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {isPassed ? '✓ Quiz Completed!' : '✗ Quiz Completed'}
          </h1>
          <p className="text-gray-600 mb-6">Thank you for taking the quiz, {submission.userEmail}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded p-4">
              <p className="text-gray-600 text-sm mb-1">Your Score</p>
              <p className="text-3xl font-bold text-blue-600">{submission.score}</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-gray-600 text-sm mb-1">Total Marks</p>
              <p className="text-3xl font-bold text-gray-900">{submission.totalMarks}</p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="text-gray-600 text-sm mb-1">Percentage</p>
              <p className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {percentage}%
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-300 rounded h-4 mb-4">
            <div
              className={`h-4 rounded transition-all ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <p className="text-gray-600">
            Submitted on {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Answer Review</h2>
          </div>

          <div className="divide-y">
            {submission.answers.map((answer, index) => {
              const question = submission.questions.find((q) => q._id === answer.questionId);
              return (
                <div key={index} className={`p-6 ${answer.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex-1">
                      Q{index + 1}: {question?.questionText}
                    </h3>
                    <span className={`ml-4 px-3 py-1 rounded text-sm font-medium ${
                      answer.isCorrect
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {answer.isCorrect ? `+${answer.marks}` : '0'} / {question?.marks}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Your Answer:</p>
                      <p className={`p-2 rounded ${answer.isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                        {answer.userAnswer || '(Not answered)'}
                      </p>
                    </div>
                    {!answer.isCorrect && (
                      <div>
                        <p className="text-gray-600 mb-1">Correct Answer:</p>
                        <p className="p-2 rounded bg-blue-100 text-blue-900">
                          {answer.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Back to Quizzes
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}
