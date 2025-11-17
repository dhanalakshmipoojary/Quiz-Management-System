import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid submission ID' }, { status: 400 });
    }

    const db = await getDb();
    const submissionsCollection = db.collection('submissions');
    const quizzesCollection = db.collection('quizzes');

    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!submission) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    // Get the quiz to include question details in the response
    const quiz = await quizzesCollection.findOne({
      _id: submission.quizId,
    });

    // Ensure questions have _id fields (convert ObjectIds to strings for frontend)
    const questionsWithIds = (quiz?.questions || []).map((q: any, index: number) => ({
      ...q,
      _id: q._id?.toString() || q._id || `temp-${index}`, // Use temp ID if no _id exists
    }));

    return NextResponse.json({
      _id: submission._id?.toString() || submission._id,
      userEmail: submission.userEmail,
      score: submission.score,
      totalMarks: submission.totalMarks,
      answers: submission.answers,
      questions: questionsWithIds,
      submittedAt: submission.submittedAt,
    });
  } catch (err) {
    console.error('/api/submissions/[id] GET error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
