import { NextResponse } from 'next/server';
import { findQuizById } from '@/lib/models/quiz';
import { createSubmission } from '@/lib/models/submission';

function toStr(v: any) {
  try {
    return v?.toString?.();
  } catch {
    return String(v);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, userEmail, answers } = body;

    if (!quizId || !userEmail || !answers) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const quiz = await findQuizById(quizId);
    if (!quiz) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

    let score = 0;

    // Normalize and compute per-answer details defensively
    const answerDetails: any[] = [];

    for (const a of answers) {
      const qId = a.questionId || a.questionId?.toString?.() || '';

      let question = quiz.questions.find((q: any) => {
        try {
          const qid = q._id ? toStr(q._id) : toStr(q.questionId ?? q.questionText);
          return qid === qId;
        } catch (e) {
          return false;
        }
      });

      // If no match by id, fall back to questionIndex (some quizzes store questions without _id)
      if (!question && typeof a.questionIndex === 'number') {
        question = quiz.questions[a.questionIndex];
      }

      if (!question) {
        // no matching question — skip
        continue;
      }

      const userAnswer = Array.isArray(a.answer) ? a.answer[0] : a.answer || '';
      const correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer[0]
        : question.correctAnswer;

      // Normalize answers: trim whitespace and convert to lowercase
      const normalizedUserAnswer = toStr(userAnswer).trim().toLowerCase();
      const normalizedCorrectAnswer = toStr(correctAnswer || '').trim().toLowerCase();

      let isCorrect = false;
      if (question.type === 'mcq' || question.type === 'true_false') {
        // Exact match for MCQ and True/False
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          isCorrect = true;
        }
      } else if (question.type === 'text') {
        // Substring match for text answers (case-insensitive)
        // Check if either string contains the other (flexible matching)
        if (normalizedUserAnswer && normalizedCorrectAnswer) {
          // User answer contains correct answer OR correct answer contains user answer
          if (normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
              normalizedCorrectAnswer.includes(normalizedUserAnswer)) {
            isCorrect = true;
          }
        } else if (!normalizedUserAnswer && !normalizedCorrectAnswer) {
          // Both are empty - consider correct
          isCorrect = true;
        } else if (normalizedUserAnswer === normalizedCorrectAnswer) {
          // Exact match (handles empty strings)
          isCorrect = true;
        }
        
        // Debug logging for text questions
        console.log('Text validation:', {
          questionIndex: a.questionIndex,
          userAnswer: normalizedUserAnswer,
          correctAnswer: normalizedCorrectAnswer,
          isCorrect,
          userContainsCorrect: normalizedUserAnswer.includes(normalizedCorrectAnswer),
          correctContainsUser: normalizedCorrectAnswer.includes(normalizedUserAnswer),
        });
      }

      if (isCorrect) score += Number(question.marks) || 0;

      answerDetails.push({
        questionIndex: a.questionIndex ?? null,
        questionId: question._id ?? question._id ?? null,
        userAnswer,
        correctAnswer: correctAnswer ?? '',
        isCorrect,
        marks: isCorrect ? Number(question.marks) || 0 : 0,
      });
    }

    const submission = await createSubmission({
      quizId: quiz._id!,
      userEmail,
      answers: answerDetails,
      score,
      totalMarks: quiz.totalMarks,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    console.error('/api/submissions POST error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
