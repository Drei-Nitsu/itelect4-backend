# itelect4-backend (GT4 Part 2)

Backend API for IT Elective 4 (GT4 Part 2: Deploy both repos, then connect them).
Built with TypeScript, Express, Mongoose, and MongoDB Atlas. Deployed as a serverless function on Vercel.

## Live Deployment Links
- **Live Backend API**: https://itelect4-backend-beryl.vercel.app
- **Live Frontend App**: https://itelect4-project-beta.vercel.app

## GT4 Part 2 Implementations
- **Reference Resource**: Course Mongoose model (`src/models/Course.ts`) with idempotent seed script (`src/seed.ts`).
- **Public Reference Routes**: `GET /api/courses` and `GET /api/courses/:id` (no auth required).
- **Dynamic CORS**: Configured to read origins dynamically from `process.env.CORS_ORIGIN`.
- **Serverless DB Connection**: Cached Mongoose connection promise and database pre-middleware in `src/app.ts`.
- **Health Check**: `GET /api/health` returning `{ ok: true, db: true }`.
- **Authentication**: JWT authentication with user registration and login (`/api/auth/*`).
- **Submissions**: Authenticated CRUD endpoints for project submissions (`/api/submissions`).
