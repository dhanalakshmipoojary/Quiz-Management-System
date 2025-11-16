import { NextResponse } from 'next/server';
import { findAllQuizzes } from '@/lib/models/quiz';

export async function GET() {
  try {
    const quizzes = await findAllQuizzes();
    // Filter to only published quizzes and exclude sensitive fields for public view
    const publicQuizzes = quizzes
      .filter((q) => q.published)
      .map(({ questions, ...rest }) => ({
        ...rest,
        // Don't send full question details to public
        totalQuestions: rest.totalQuestions,
        totalMarks: rest.totalMarks,
      }));
    return NextResponse.json(publicQuizzes);
  } catch (err) {
    console.error('/api/public/quizzes GET error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
