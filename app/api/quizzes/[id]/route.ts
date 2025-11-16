import { NextResponse } from 'next/server';
import { findQuizById, updateQuiz, deleteQuiz } from '@/lib/models/quiz';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await findQuizById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json(quiz);
  } catch (err) {
    console.error(`/api/quizzes/[id] GET error:`, err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('PUT /api/quizzes/[id] - ID:', id);
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body).substring(0, 200));
    
    const quiz = await updateQuiz(id, body);
    console.log('Updated quiz result:', quiz ? 'found' : 'null');
    
    if (!quiz) {
      console.error('updateQuiz returned null for id:', id);
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json(quiz);
  } catch (err) {
    console.error(`/api/quizzes/[id] PUT error:`, err);
    return NextResponse.json({ message: 'Server error', error: (err as any).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteQuiz(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    console.error(`/api/quizzes/[id] DELETE error:`, err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
