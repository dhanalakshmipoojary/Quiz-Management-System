 # Plan & Implementation Notes — Quiz Management System

This file records the original plan and scope changes that occurred during implementation, plus the current state and next steps.

## Assumptions (original)
- Application built using Next.js App Router
- MongoDB used as the database
- Admin authenticates with email + password (bcrypt + JWT)
- Public users do not require password authentication (only email collection)
- Question types: MCQ, True/False, Text

## Major Scope Changes (during implementation)
- Implemented custom JWT-based admin auth with HttpOnly cookie (originally planned, but details refined).
- Added a full public portal (landing page, take-quiz flow, results) with its own APIs.
- Added a `submissions` model and endpoints to record attempts and compute scores server-side.
- Introduced a `public user` record (stored in `users` with `role: 'public'`) created on-demand when a public user starts a quiz.
- Improved scoring logic to be robust for mixed data shapes (string | string[]), and to tolerate quizzes where questions lack `_id` by matching via index.
- Adjusted server code for Next.js 16 breaking changes (route `params` is a Promise; dynamic route handling updated).

## Current Scope (what the app now includes)
- Admin features
	- Login / logout (JWT in HttpOnly cookie)
	- Admin dashboard: list, create, edit, delete quizzes
	- Question editor supporting MCQ, True/False, Text
	- Set per-question marks, T&C, and `published` flag
	- Publish / Unpublish action and publish checkbox in create/edit form

- Public features
	- Landing page listing published quizzes (`app/page.tsx`)
	- Quiz-taking flow (`/quizzes/[id]/take`): email collection, T&C acceptance, question carousel
	- Submission API that computes score and stores submission with per-question breakdown
	- Results page (`/results/[id]`) showing score, percentage and per-question review
	- Public user creation endpoint to track attempts by email

- Backend APIs
	- Admin: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
	- Quiz CRUD: `GET/POST /api/quizzes`, `GET/PUT/DELETE /api/quizzes/[id]`
	- Public quizzes: `GET /api/public/quizzes`, `GET /api/public/quizzes/[id]`
	- Submissions: `POST /api/submissions`, `GET /api/submissions/[id]`
	- Public users: `POST /api/public/users` (create/find by email)

## Completed Tasks
- Admin authentication and seeding admin user
- Admin dashboard with quiz CRUD and question editor
- Public landing page and quiz-taking UI
- Submission model, scoring logic and storage
- Results page and per-question review
- Publish/unpublish UI and API integration

## In-Progress / Pending (priority order)
1. Tests: add unit tests for scoring and submission logic (high priority)
2. Server-side validation for API requests (Zod or similar)
3. Ensure quizzes have stable question `_id` on save (populate server-side if necessary)
4. Improve client error reporting (avoid generic "Server error")
5. Documentation updates (expand README, complete `PLAN.md` — this file)

## Nice-to-have (future)
- Autosave quiz answers (localStorage or server partial saves)
- Time-limited quizzes and per-question timers
- User attempt history / leaderboard
- Email verification for public users and notification hooks
- Import/export (CSV/JSON) for quizzes

## Implementation Notes / Gotchas
- Next.js 16 App Router: some route handlers expect `params` to be awaited (e.g., `const { id } = await params`). Keep this in mind when writing dynamic API routes or page server code.
- The scoring logic treats MCQ/TrueFalse as case-insensitive exact match; Text questions use a substring (contains) check — this was chosen for simplicity and can be refined later (e.g., fuzzy matching or regex).
- Some older quizzes in the DB may not have `_id` on question objects (seed scripts used plain objects). Submission handling now falls back to the `questionIndex` when `_id` is missing.
- To avoid client-visible generic errors, server-side endpoints should return helpful messages and HTTP status codes; consider adding request schema validation.

## Next Actions (pick one)
- Add unit tests for scoring and submission endpoint (recommended first step).
- Add server-side validation with `zod` and return structured errors to the client.
- Ensure question `_id` population when saving quizzes (small server-side migration or update on save).

If you want, I can implement tests now (adds test files + basic runner) or add request validation next — which would you prefer?