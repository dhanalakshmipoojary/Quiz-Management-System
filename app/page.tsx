
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  totalMarks: number;
  published?: boolean;
}

export default function QuizLandingPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    try {
      const res = await fetch('/api/public/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error('Error loading quizzes:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Portal</h1>
          <p className="text-gray-600 mt-1">Take quizzes and test your knowledge</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading quizzes...</div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No quizzes available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>📝 {quiz.totalQuestions} questions</span>
                  <span>⭐ {quiz.totalMarks} marks</span>
                </div>

                <Link
                  href={`/quizzes/${quiz._id}/take`}
                  className="w-full block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Start Quiz
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm">
          <p>&copy; 2025 Quiz Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
