import { NextResponse } from 'next/server';
import { findQuizById } from '@/lib/models/quiz';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await findQuizById(id);
    
    if (!quiz || !quiz.published) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (err) {
    console.error(`/api/public/quizzes/[id] GET error:`, err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
