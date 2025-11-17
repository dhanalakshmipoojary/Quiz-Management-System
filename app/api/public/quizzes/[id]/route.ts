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

    // Ensure questions have _id fields (convert ObjectIds to strings for frontend)
    const questionsWithIds = quiz.questions.map((q: any, index: number) => ({
      ...q,
      _id: q._id?.toString() || q._id || `temp-${index}`, // Use temp ID if no _id exists
    }));

    return NextResponse.json({
      ...quiz,
      questions: questionsWithIds,
    });
  } catch (err) {
    console.error(`/api/public/quizzes/[id] GET error:`, err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
