'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Question {
  _id?: string;
  questionText: string;
  type: 'mcq' | 'text' | 'true_false';
  options?: string[];
  correctAnswer: string | string[];
  marks: number;
}

interface Quiz {
  _id?: string;
  title: string;
  description?: string;
  termsAndConditions?: string;
  questions: Question[];
  totalQuestions: number;
  totalMarks: number;
  published?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [formData, setFormData] = useState<Quiz>({
    title: '',
    description: '',
    termsAndConditions: '',
    questions: [],
    totalQuestions: 0,
    totalMarks: 0,
    published: false,
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionText: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await loadQuizzes();
      } else {
        router.push('/admin');
      }
    } catch (err) {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }

  async function loadQuizzes() {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error('Error loading quizzes:', err);
    }
  }

  async function handleSaveQuiz() {
    try {
      const url = editingQuiz ? `/api/quizzes/${editingQuiz._id}` : '/api/quizzes';
      const method = editingQuiz ? 'PUT' : 'POST';

      // Remove _id and timestamp fields from formData for update
      const payload = { ...formData };
      if (method === 'PUT') {
        delete (payload as any)._id;
        delete (payload as any).createdAt;
        delete (payload as any).updatedAt;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await loadQuizzes();
        resetForm();
        setCurrentTab('list');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error response:', res.status, errorData);
        alert(`Error saving quiz: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error: ' + (err as Error).message);
    }
  }

  async function handleDeleteQuiz(id: string) {
    if (confirm('Are you sure?')) {
      try {
        const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await loadQuizzes();
        }
      } catch (err) {
        alert('Error deleting quiz');
      }
    }
  }

  async function togglePublish(id: string, publish: boolean) {
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish }),
      });
      if (res.ok) {
        await loadQuizzes();
      } else {
        const e = await res.json().catch(() => ({}));
        alert('Error updating publish status: ' + (e.message || res.statusText));
      }
    } catch (err) {
      console.error('Publish toggle error', err);
      alert('Error toggling publish status');
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      termsAndConditions: '',
      questions: [],
      totalQuestions: 0,
      totalMarks: 0,
      published: false,
    });
    setEditingQuiz(null);
    setCurrentQuestion({
      questionText: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    });
  }

  function addQuestion() {
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter question text');
      return;
    }

    const totalMarks = formData.questions.reduce((sum, q) => sum + q.marks, 0) + currentQuestion.marks;
    setFormData({
      ...formData,
      questions: [...formData.questions, currentQuestion],
      totalQuestions: formData.questions.length + 1,
      totalMarks,
    });
    setCurrentQuestion({
      questionText: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    });
  }

  function removeQuestion(index: number) {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    const totalMarks = newQuestions.reduce((sum, q) => sum + q.marks, 0);
    setFormData({
      ...formData,
      questions: newQuestions,
      totalQuestions: newQuestions.length,
      totalMarks,
    });
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin');
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setCurrentTab('list')}
            className={`px-4 py-2 rounded font-semibold ${
              currentTab === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            My Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => {
              resetForm();
              setCurrentTab('create');
            }}
            className={`px-4 py-2 rounded font-semibold ${
              currentTab === 'create' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Create Quiz
          </button>
        </div>

        {/* Quiz List Tab */}
        {currentTab === 'list' && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Quizzes</h2>
            {quizzes.length === 0 ? (
              <p className="text-gray-500">No quizzes yet. Create one to get started!</p>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="border rounded p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-2">
                        <span>{quiz.totalQuestions} questions</span>
                        <span>{quiz.totalMarks} marks</span>
                        <span className={quiz.published ? 'text-green-600' : 'text-yellow-600'}>
                          {quiz.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setFormData(quiz);
                          setCurrentTab('edit');
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => togglePublish(quiz._id!, !quiz.published)}
                        className={`px-3 py-1 text-white rounded text-sm ${quiz.published ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {quiz.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id!)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Quiz Tab */}
        {(currentTab === 'create' || currentTab === 'edit') && (
          <div className="grid grid-cols-3 gap-6">
            {/* Form */}
            <div className="col-span-2 bg-white rounded shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{editingQuiz ? 'Edit' : 'Create'} Quiz</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Quiz Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Quiz description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Terms & Conditions</label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="T&C text"
                    rows={3}
                  />
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold mb-3">Add Questions</h3>

                  <div className="space-y-3 border rounded p-3 bg-gray-50">
                    <div>
                      <label className="block text-sm font-medium">Question Text *</label>
                      <textarea
                        value={currentQuestion.questionText}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="Enter question"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium">Type</label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              type: e.target.value as 'mcq' | 'text' | 'true_false',
                            })
                          }
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="text">Text</option>
                          <option value="true_false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Marks</label>
                        <input
                          type="number"
                          value={currentQuestion.marks}
                          onChange={(e) =>
                            setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })
                          }
                          className="w-full border rounded px-3 py-2"
                          min="1"
                        />
                      </div>
                    </div>

                    {currentQuestion.type === 'mcq' && (
                      <div>
                        <label className="block text-sm font-medium">Options</label>
                        <div className="space-y-2">
                          {currentQuestion.options?.map((opt, idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(currentQuestion.options || [])];
                                newOpts[idx] = e.target.value;
                                setCurrentQuestion({ ...currentQuestion, options: newOpts });
                              }}
                              className="w-full border rounded px-3 py-2 text-sm"
                              placeholder={`Option ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium">Correct Answer *</label>
                      {currentQuestion.type === 'true_false' ? (
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) =>
                            setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">Select answer</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : currentQuestion.type === 'mcq' ? (
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) =>
                            setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">Select answer</option>
                          {currentQuestion.options?.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={currentQuestion.correctAnswer}
                          onChange={(e) =>
                            setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value.trim().toLowerCase() })
                          }
                          className="w-full border rounded px-3 py-2"
                          placeholder="Correct answer"
                        />
                      )}
                    </div>

                    <button
                      onClick={addQuestion}
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveQuiz}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    {editingQuiz ? 'Update' : 'Create'} Quiz
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setCurrentTab('list');
                    }}
                    className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Preview */}
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold mb-4">Questions ({formData.questions.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.questions.map((q, idx) => (
                  <div key={idx} className="border rounded p-2 bg-gray-50">
                    <p className="text-sm font-medium">{idx + 1}. {q.questionText}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {q.type} | Marks: {q.marks}
                    </p>
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="text-xs text-red-600 mt-2 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm">
                  <strong>Total Questions:</strong> {formData.totalQuestions}
                </p>
                <p className="text-sm">
                  <strong>Total Marks:</strong> {formData.totalMarks}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
