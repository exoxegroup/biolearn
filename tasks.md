# Backend Implementation Tasks

This document breaks down the full backend implementation into phased tasks, replacing mock data with real API connections using .env for configuration (e.g., database URL, JWT secret, etc.). Each phase includes implementation steps, frontend integration where applicable, and local testing. We'll proceed sequentially, testing locally after each phase.

## Phase 1: Environment Setup and Database Configuration
- Set up .env file in backend with necessary variables (e.g., DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).
- Install backend dependencies (e.g., prisma, @prisma/client, jsonwebtoken, bcrypt, express).
- Update Prisma schema if needed based on PRD (add models for Users, Classes, Quizzes, Groups, Notes, etc.).
- Run Prisma migrations to set up the database (e.g., PostgreSQL).
- Test: Start the backend server locally, connect to the database, and verify schema creation using a tool like TablePlus.

## Phase 2: Implement Authentication and User Management
- Implement user registration, login, and profile completion endpoints in authController.ts.
- Add Google OAuth using NextAuth or passport-google-oauth20.
- Secure routes with JWT in authMiddleware.ts.
- Update frontend api.ts to call real auth endpoints instead of mockApi.ts.
- Test: Register/login users via Postman or frontend, verify JWT tokens, ensure profile completion redirects work.

## Phase 3: Implement Class Management
3.1 - Create endpoints for teachers to create/edit/delete classes, generate unique codes.
3.2 - Implement student enrollment via class code.
3.3 - Add YouTube embed endpoints **[COMPLETED]**
3.4- Integrate Cloudinary for resource uploads (PDF/DOCX), configured for deployment on Render.com free-tier  see setup guide in cloudinary_setup.md file. **[COMPLETED]**
3.5 - Connect frontend pages like StudentDashboard.tsx, TeacherDashboard.tsx and ClassroomPage.tsx to these endpoints.
3.6 - Test: Create a class, enroll students, upload resources, verify data persistence in DB.

## Phase 4: Implement Quiz Management
4.1 - Develop endpoints for creating/editing quizzes (pretest/posttest) with MCQs, timers, and reuse options.
4.2 - Add student quiz submission and scoring.
4.3 - Integrate with frontend QuizEditor.tsx and PretestView.tsx/PosttestView.tsx, removing mocks.
4.4 - Test: Create quizzes, take them as student, check scores in DB and dashboards.

## Phase 5: Implement Group and Collaboration Features
5.1 - Endpoints for assigning students to groups, managing group stages.
5.2 - Implement shared notes persistence.
5.3 - Integrate AI assistant (Gemini) for group queries.
5.4 - Connect frontend components like GroupSessionView.tsx, SharedNotes.tsx, AIAssistant.tsx.
5.5 - Test: Assign groups, create notes, query AI, verify teacher monitoring.

## Phase 6: Real-time Features and Class Controls
6.1 - Integrate Socket.io for real-time presence, chat, and stage controls (start/end class/group).
6.2 - Embed Jitsi for video/audio in main and group rooms.
6.3 - Update frontend Chat.tsx and views for real-time updates.
6.4 - Test: Simulate a class session with multiple users, check real-time updates and video.

## Phase 7: Analytics and Final Integration
7.1 - Implement endpoints for performance analytics (scores, engagement metrics, gender comparisons).
7.2 - Ensure all frontend pages use real APIs, remove all mock data.
7.3 - Full end-to-end testing.
7.4 - Test: Run complete user flows, verify metrics in dashboards.

After each phase, we'll run local tests (backend with nodemon, frontend with vite) and confirm functionality before moving on.