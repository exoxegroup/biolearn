# BioLearn AI: Backend Implementation Plan

This document outlines the tasks required to build a Node.js/Express backend and connect it to the BioLearn AI React frontend, transitioning from mock data to a fully persistent and functional application.

**Follow these phases sequentially.** Each phase builds upon the last and corresponds to a set of features in the frontend. Test each phase thoroughly before proceeding.

### Backend Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens), Google OAuth
- **Real-time:** Socket.io
- **File Uploads:** Cloudinary

---

### Phase 1: Environment Setup and Database Configuration

**Goal:** Establish the foundational backend project, configure the development environment, and set up the database schema.

1.  **Initialize Node.js Project:**
    - Create a new directory for your backend.
    - Run `npm init -y`.
    - Install core dependencies: `npm install express cors dotenv bcrypt jsonwebtoken @google/genai @prisma/client socket.io passport passport-google-oauth20 cloudinary multer`
    - Install development dependencies: `npm install -D typescript ts-node nodemon @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/passport @types/passport-google-oauth20 @types/multer prisma`

2.  **Setup TypeScript:**
    - Run `npx tsc --init` to create a `tsconfig.json` file.
    - Configure `tsconfig.json`: set `outDir` to `"./dist"`, `rootDir` to `"./src"`.

3.  **Setup Prisma and PostgreSQL:**
    - Set up a `.env` file in the `backend` directory with necessary variables (e.g., `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_URL`).
    - Initialize Prisma: `npx prisma init --datasource-provider postgresql`. This updates the `.env` file.
    - **Define the Prisma Schema:** Ensure the `prisma/schema.prisma` file matches the database structure. A complete schema is provided at the end of this document for reference.
    - **Run Migrations:** Use `npx prisma migrate dev --name init` to create the database tables based on your schema.
    - **Generate Prisma Client:** Run `npx prisma generate` to create the type-safe client.

4.  **Create Basic Server Structure:**
    - `src/index.ts`: Main server entry point.
    - `src/routes/`: Directory for API route handlers.
    - `src/controllers/`: Directory for business logic.
    - `src/middleware/`: Directory for middleware (e.g., auth).
    - `src/prisma.ts`: To export a singleton Prisma client instance.
    - `src/config/`: For configurations like Passport.js.

---

### Phase 2: Implement Authentication and User Management

**Goal:** Replace mock authentication with a robust system for user registration, login (including Google OAuth), and profile management.

1.  **Backend Tasks:**
    - **Create Auth Controller (`authController.ts`):**
        - `register`: Hash password, create a new user in DB. Return user info and a JWT.
        - `login`: Find user, compare hashed password. Return user info and a JWT if valid.
    - **Implement Google OAuth:**
        - Use `passport-google-oauth20` for one-click sign-up/login.
        - Configure Passport to handle user creation and login on successful OAuth.
    - **Create User Profile Endpoints (`userController.ts`):**
        - `PUT /api/users/profile`: Update user's phone, address, and set `isProfileComplete` to true. This should be a protected route.
        - `GET /api/users/me`: Get current user's data based on JWT for session persistence.
    - **Create Auth Routes (`authRoutes.ts`):**
        - `POST /api/auth/register`
        - `POST /api/auth/login`
        - `GET /api/auth/google` (initiates OAuth)
        - `GET /api/auth/google/callback` (handles redirect)
    - **Create Auth Middleware (`authMiddleware.ts`):**
        - A middleware that verifies the JWT from the `Authorization` header and attaches the user payload to the request object.

2.  **Frontend Integration:**
    - In `services/api.ts`, create functions (`registerUser`, `loginUser`, `updateUserProfile`, `getCurrentUser`) to call the new backend endpoints.
    - In `AuthContext.tsx`, replace calls to `mockApi` with the new `api.ts` functions.
    - Implement token storage (e.g., in `localStorage`) and an API client instance that automatically attaches the `Authorization: Bearer <token>` header.

---

### Phase 3: Implement Class Management

**Goal:** Enable teachers to create and manage classes, and students to enroll in them. Allow for resource sharing.

1.  **3.1: Teacher Class Management:**
    - **Controller:** In `classController.ts`, create functions for `createClass`, `updateClass`, and `deleteClass`. The `createClass` function should generate a unique alphanumeric `classCode`.
    - **Routes:** Create protected `POST`, `PUT`, and `DELETE` routes in `classRoutes.ts` for managing classes.
    - **Controller:** Add `getTeacherClasses` to fetch all classes created by the logged-in teacher.

2.  **3.2: Student Enrollment:**
    - **Controller:** In `enrollmentController.ts`, create a `joinClass` function that finds a class by `classCode` and creates a `StudentEnrollment` record.
    - **Controller:** Add `getStudentClasses` to fetch all classes a student is enrolled in.
    - **Routes:** Create protected routes for joining a class and fetching enrolled classes.

3.  **3.3 & 3.4: Resource Management (YouTube & File Uploads):**
    - **Controller:** In `materialController.ts`, create functions to handle resource management.
    - **YouTube:** Create an `addYoutubeLink` function that saves a material of type `youtube` with a URL.
    - **File Uploads:** Integrate `cloudinary` and `multer` to handle file uploads (`.pdf`, `.docx`). Create an `uploadFile` function that uploads the file to Cloudinary and saves a material of type `pdf` or `docx` with the secure URL.
    - **Routes:** Create protected routes for adding and deleting materials from a class.

4.  **3.5 & 3.6: Frontend Integration and Testing:**
    - **API:** Implement functions in `api.ts` to call all new class, enrollment, and material endpoints.
    - **UI:** Connect `TeacherDashboard.tsx`, `StudentDashboard.tsx`, and `ManageClassContentPage.tsx` to the API functions, removing mock data.
    - **Testing:** Perform end-to-end local tests:
        - A teacher creates a class.
        - A student joins the class using the code.
        - The teacher uploads a PDF and adds a YouTube link.
        - Remaining CRUD operations on CLASS i.e Update, Delete.
        - Verify all data is correctly persisted in the database.

---

### Phase 4: Implement Quiz Management

**Goal:** Allow teachers to create and manage pre-tests and post-tests, and for students to take them and receive scores.

1.  **4.1: Quiz Creation Endpoints:**
    - **Controller (`quizController.ts`):**
        - `updateQuiz`: Allow teachers to create/update Pre- and Post-tests with questions, options, correct answers, and time limits. Handle the option to reuse pre-test questions for the post-test.
    - **Routes (`quizRoutes.ts`):** Create protected routes for creating and updating quizzes.

2.  **4.2: Quiz Submission and Scoring:**
    - **Controller (`quizController.ts`):**
        - `getQuiz`: Fetch a quiz for a student to take.
        - `submitQuiz`: Record student answers, calculate the score, and save it in the `StudentEnrollment` table.
    - **Routes (`quizRoutes.ts`):** Create protected routes for fetching and submitting quizzes.

3.  **4.3: Frontend Integration:**
    - **API:** Implement API functions for all quiz-related actions.
    - **UI:** Connect `ManageQuizzesPage.tsx` and `QuizEditor.tsx` for quiz creation.
    - **UI:** Connect `PretestView.tsx` and `PosttestView.tsx` to fetch questions and submit answers, removing all mock data.

4.  **4.4: Testing:**
    - **Local Tests:**
        - A teacher creates a pre-test and a post-test.
        - A student takes the pre-test.
        - A student takes the post-test.
        - Verify scores are correctly saved in the database and displayed on the dashboards.

---

### Phase 5: Implement Group and Collaboration Features

**Goal:** Enable teachers to manage student groups and facilitate real-time collaboration with shared notes and an AI assistant.

1.  **5.1: Group Management:**
    - **Controller:** Create functions to assign students to groups within a class (`assignGroups`).
    - **Routes:** Create a protected route for the teacher to submit group assignments.

2.  **5.2: Shared Notes Persistence:**
    - **Socket Event:** Create a `note:update` socket event handler.
    - **Logic:** When a note is updated, save the content to the `GroupNote` table and broadcast the new content to the other members of that specific group room.

3.  **5.3: AI Assistant Integration:**
    - **Controller (`aiController.ts`):** Create a `getAIResponse` function that takes a prompt from the client. It should use the Gemini API key from the server's `.env` file to generate content and return the response.
    - **Route (`aiRoutes.ts`):** Create a protected `POST /api/ai/query` route.

4.  **5.4: Frontend Integration:**
    - **UI:** Connect the student management UI to the `assignGroups` endpoint.
    - **Shared Notes:** Modify `SharedNotes.tsx` to use sockets for real-time updates.
    - **AI Assistant:** Modify `geminiService.ts` in the frontend to call the new secure `/api/ai/query` backend endpoint instead of the Google AI SDK directly. Remove the API key from the frontend environment.

5.  **5.5: Testing:**
    - **Local Tests:**
        - A teacher assigns students to groups.
        - Students in a group collaborate on a note and see real-time updates.
        - A student queries the AI assistant.
        - The teacher monitors the group notes.

---

### Phase 6: Real-time Features and Class Controls

**Goal:** Use WebSockets to manage the classroom lifecycle and enable real-time communication.

1.  **6.1: Socket.io Integration:**
    - **Integration:** Attach Socket.io to the main HTTP server.
    - **Room Management:** When a user connects, they should `join` a room specific to their class (e.g., `class_room_${classId}`).
    - **Teacher Controls:** Create handlers for events emitted by the teacher:
        - On `teacher:start-class`, broadcast `class:state-changed` with `{ status: 'MAIN_SESSION' }`.
        - On `teacher:activate-groups`, broadcast `class:state-changed` with `{ status: 'GROUP_SESSION' }`.
        - On `teacher:end-class`, broadcast `class:state-changed` with `{ status: 'POSTTEST' }`.
    - **Chat:** Handle `chat:send-message` events and broadcast `chat:receive-message` to the appropriate room (main class room or mini-group room).
    - **Presence:** Implement logic to track and broadcast user online/offline status within a class.

2.  **6.2: Jitsi Integration:**
    - **Frontend:** Embed the Jitsi client for video conferencing in both the main and group session views.

3.  **6.3: Frontend Real-time Updates:**
    - **Socket Client:** Install `socket.io-client` and create a `SocketContext.tsx` to manage the connection and event listeners.
    - **Classroom Page:** Refactor `ClassroomPage.tsx` to remove state simulations. Use the `SocketContext` to emit teacher actions and listen for `class:state-changed` events to update the UI.
    - **Chat:** Connect `Chat.tsx` to use the socket for sending and receiving messages.

4.  **6.4: Testing:**
    - **Local Tests:**
        - Simulate a full class session with multiple users.
        - Verify that real-time updates for class state, chat, and presence are working correctly.
        - Check that video conferencing is functional.

---

### Phase 7: Analytics and Final Integration

**Goal:** Provide teachers with performance analytics and ensure the entire application is connected and free of mock data.

1.  **7.1: Analytics Endpoints:**
    - **Analytics Controller (`analyticsController.ts`):**
        - `getClassAnalytics`: Aggregate and return Pre/Post-test scores for all students in a class.
        - `getEngagementAnalytics`: Collect and return data on chat messages and AI queries, allowing for gender-based comparison as per the PRD.
    - **Routes (`analyticsRoutes.ts`):** Create protected routes to fetch analytics data.

2.  **7.2: Final Frontend Integration:**
    - **API:** Implement API functions for analytics endpoints.
    - **UI:** Connect `PerformanceAnalyticsPage.tsx` to display the fetched data.
    - **Final Review:** Conduct a full audit of the frontend to ensure all mock data and `mockApi.ts` calls have been removed and replaced with live API calls.

3.  **7.3 & 7.4: End-to-End Testing:**
    - **Full User Flow:**
        - A new teacher registers and creates a class.
        - New students register and join the class.
        - The teacher uploads materials and creates quizzes.
        - The students take the pre-test.
        - The teacher starts the class, runs a group session, and ends the class.
        - The students take the post-test.
        - The teacher reviews the performance analytics.
    - **Verification:** Confirm that all data is correctly persisted and that all features work as expected.

### Phase 8: Additional Features and Refinements
1. **8.1: Teacher dashboard:**
    - Teacher can rename a class.
    - Teacher can delete a class.

---

### Complete Prisma Schema (for reference)
This schema corresponds to the `schema.sql` file. Place this in `prisma/schema.prisma` and run `npx prisma migrate dev`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  password          String? // Optional for OAuth users
  googleId          String?  @unique // For Google OAuth
  gender            Gender
  role              UserRole
  phone             String?
  address           String?
  isProfileComplete Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  createdClasses    Class[]             @relation("ClassTeacher")
  enrollments       StudentEnrollment[]
  quizSubmissions   QuizSubmission[]
  sentMessages      ChatMessage[]
}

model Class {
  id                            String   @id @default(cuid())
  name                          String
  classCode                     String   @unique
  teacherId                     String
  posttestUsesPretestQuestions  Boolean  @default(false)
  createdAt                     DateTime @default(now())
  updatedAt                     DateTime @updatedAt

  // Relations
  teacher         User                @relation("ClassTeacher", fields: [teacherId], references: [id], onDelete: Cascade)
  enrollments     StudentEnrollment[]
  materials       Material[]
  pretest         Quiz?               @relation("PretestForClass")
  posttest        Quiz?               @relation("PosttestForClass")
  groupNotes      GroupNote[]
}

model StudentEnrollment {
  id            String   @id @default(cuid())
  classId       String
  studentId     String
  groupNumber   Int?
  pretestScore  Float?
  posttestScore Float?
  
  // Relations
  class         Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  student       User     @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([classId, studentId])
}

model Material {
  id        String       @id @default(cuid())
  classId   String
  type      MaterialType
  title     String
  url       String
  createdAt DateTime     @default(now())

  // Relations
  class     Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
}

model Quiz {
  id               String       @id @default(cuid())
  title            String
  timeLimitMinutes Int
  type             QuizType
  classId_pretest  String?      @unique
  classId_posttest String?      @unique
  
  // Relations
  pretestForClass  Class?       @relation("PretestForClass", fields: [classId_pretest], references: [id], onDelete: Cascade)
  posttestForClass Class?       @relation("PosttestForClass", fields: [classId_posttest], references: [id], onDelete: Cascade)
  questions        Question[]
  submissions      QuizSubmission[]
}

model Question {
  id                 String   @id @default(cuid())
  quizId             String
  text               String
  options            String[]
  correctAnswerIndex Int

  // Relations
  quiz               Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

model QuizSubmission {
  id        String   @id @default(cuid())
  quizId    String
  studentId String
  score     Float
  submittedAt DateTime @default(now())

  // Relations
  quiz      Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  student   User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

model GroupNote {
  id        String   @id @default(cuid())
  classId   String
  groupId   Int
  content   String   @default("")
  updatedAt DateTime @updatedAt

  // Relations
  class     Class    @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@unique([classId, groupId])
}

model ChatMessage {
  id          String    @id @default(cuid())
  classId     String
  groupId     Int? // Null for main classroom chat
  senderId    String
  text        String
  isAI        Boolean   @default(false)
  timestamp   DateTime  @default(now())

  // Relations
  sender      User      @relation(fields: [senderId], references: [id], onDelete: Cascade)
}

enum UserRole {
  TEACHER
  STUDENT
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum MaterialType {
  pdf
  docx
  youtube
}

enum QuizType {
  PRETEST
  POSTTEST
}
