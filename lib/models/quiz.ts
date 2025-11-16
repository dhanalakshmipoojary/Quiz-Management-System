import { getDb } from '../mongodb';
import { ObjectId } from 'mongodb';

export type Question = {
  _id?: ObjectId;
  questionText: string;
  type: 'mcq' | 'text' | 'true_false';
  options?: string[];
  correctAnswer: string | string[];
  marks: number;
};

export type Quiz = {
  _id?: ObjectId;
  title: string;
  description?: string;
  termsAndConditions?: string;
  questions: Question[];
  totalQuestions: number;
  totalMarks: number;
  createdAt?: Date;
  updatedAt?: Date;
  published?: boolean;
};

export async function findAllQuizzes(): Promise<Quiz[]> {
  const db = await getDb();
  return db.collection<Quiz>('quizzes').find({}).toArray();
}

export async function findQuizById(id: string): Promise<Quiz | null> {
  const db = await getDb();
  try {
    return await db.collection<Quiz>('quizzes').findOne({ _id: new ObjectId(id) });
  } catch {
    return null;
  }
}

export async function createQuiz(quiz: Omit<Quiz, '_id'>): Promise<Quiz> {
  const db = await getDb();
  const res = await db.collection('quizzes').insertOne({
    ...quiz,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { ...quiz, _id: res.insertedId } as Quiz;
}

export async function updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
  const db = await getDb();
  try {
    console.log('updateQuiz called with id:', id);
    const objId = new ObjectId(id);
    console.log('Converting to ObjectId:', objId.toString());
    
    const result = await db.collection<Quiz>('quizzes').findOneAndUpdate(
      { _id: objId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' as const }
    );
    
    console.log('findOneAndUpdate result:', result ? 'found document' : 'no document');
    return result.value || null;
  } catch (err) {
    console.error('updateQuiz error:', err);
    return null;
  }
}

export async function deleteQuiz(id: string): Promise<boolean> {
  const db = await getDb();
  try {
    const res = await db.collection('quizzes').deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  } catch {
    return false;
  }
}
