import { getDb } from '../mongodb';
import { ObjectId } from 'mongodb';

export type Submission = {
  _id?: ObjectId;
  quizId: ObjectId;
  userEmail: string;
  answers: {
    questionIndex: number;
    answer: string | string[];
  }[];
  score: number;
  totalMarks: number;
  submittedAt?: Date;
};

export async function createSubmission(submission: Omit<Submission, '_id'>): Promise<Submission> {
  const db = await getDb();
  const res = await db.collection('submissions').insertOne({
    ...submission,
    submittedAt: new Date(),
  });
  return { ...submission, _id: res.insertedId } as Submission;
}

export async function findSubmissionsByEmail(email: string): Promise<Submission[]> {
  const db = await getDb();
  return db.collection<Submission>('submissions').find({ userEmail: email }).toArray();
}

export async function findSubmissionById(id: string): Promise<Submission | null> {
  const db = await getDb();
  try {
    return await db.collection<Submission>('submissions').findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}
