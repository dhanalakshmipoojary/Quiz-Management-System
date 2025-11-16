import { NextResponse } from 'next/server';
import { findAllQuizzes, createQuiz } from '@/lib/models/quiz';

export async function GET() {
  try {
    const quizzes = await findAllQuizzes();
    return NextResponse.json(quizzes);
  } catch (err) {
    console.error('/api/quizzes GET error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, termsAndConditions, questions } = body;

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
    const quiz = await createQuiz({
      title,
      description,
      termsAndConditions,
      questions: questions || [],
      totalQuestions: questions?.length || 0,
      totalMarks,
      published: false,
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (err) {
    console.error('/api/quizzes POST error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
