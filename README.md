# Quiz Management System

A complete quiz management platform built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Features

### Admin Features
- User Authentication with email and password
- Quiz Management (Create, Edit, Delete)
- Question Types: MCQ, True/False, Text
- Per-Question Marks Assignment
- Quiz Publishing Control
- Terms & Conditions Support

### Public Features
- Quiz Listing and Browsing
- Quiz Taking with One-by-One Questions
- Email Collection Before Participation
- Instant Scoring & Results
- Detailed Answer Review
- Print Results

## Setup

### 1. Install Dependencies
\\\ash
npm install
\\\

### 2. Configure .env.local
\\\env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=quiz_app
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASS=admin@123
\\\

### 3. Seed Admin User
\\\ash
node scripts/seed-admin.js
\\\

### 4. Run Development Server
\\\ash
npm run dev
\\\

## Admin Login
- URL: http://localhost:3000/admin/login
- Email: admin@gmail.com
- Password: admin@123

## Public Portal
- URL: http://localhost:3000
- Browse quizzes, enter email, take quiz, view results

## API Endpoints

### Admin (Protected)
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET/POST /api/quizzes
- GET/PUT/DELETE /api/quizzes/[id]

### Public
- GET /api/public/quizzes
- GET /api/public/quizzes/[id]
- POST /api/submissions
- GET /api/submissions/[id]

## Tech Stack
- Next.js 16.0.3
- TypeScript
- MongoDB
- bcryptjs + JWT
- Tailwind CSS 4
- React 19

## Project Structure
\\\
app/
 (admin)/login/page.tsx
 (admin)/dashboard/page.tsx
 api/
    auth/
    quizzes/
    public/
    submissions/
 quizzes/[id]/take/page.tsx
 results/[id]/page.tsx
 page.tsx

lib/
 mongodb.ts
 auth.ts
 models/
     user.ts
     quiz.ts
     submission.ts
\\\

## Scoring Logic
- MCQ/True-False: Exact match (case-insensitive)
- Text: Substring match (case-insensitive)
- Full marks only if correct, otherwise 0

## License
MIT

