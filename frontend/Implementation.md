
# BioLearn AI: Backend Implementation Plan

This document outlines the tasks required to build a Node.js/Express backend and connect it to the BioLearn AI React frontend, transitioning from mock data to a fully persistent and functional application.

**Follow these phases sequentially.** Each phase builds upon the last and corresponds to a set of features in the frontend. Test each phase thoroughly before proceeding.

### Backend Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io

---

### Phase 0: Project Setup

1.  **Initialize Node.js Project:**
    - Create a new directory for your backend.
    - Run `npm init -y`.
    - Install core dependencies: `npm install express cors dotenv bcrypt jsonwebtoken @google/genai @prisma/client socket.io`
    - Install development dependencies: `npm install -D typescript ts-node nodemon @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken prisma`

2.  **Setup TypeScript:**
    - Run `npx tsc --init` to create a `tsconfig.json` file.
    - Configure `tsconfig.json`: set `outDir` to `"./dist"`, `rootDir` to `"./src"`.

3.  **Setup Prisma and PostgreSQL:**
    - Install Prisma: The dependencies are already listed above.
    - Initialize Prisma: `npx prisma init --datasource-provider postgresql`
    - This creates a `prisma` directory and a `.env` file. Update your database URL in the `.env` file.
    - **Define the Prisma Schema:** Ensure the `prisma/schema.prisma` file matches the database structure. A complete schema is provided at the end of this document for reference.
    - **Create Database Tables Manually:**
        - Open the `schema.sql` file provided in the project.
        - Copy the entire SQL script.
        - In your database management tool (e.g., TablePlus), connect to your PostgreSQL database, open a new query window, paste the script, and execute it. This will create all necessary tables and types.
    - **Generate Prisma Client:** After your tables are created in the database, you must generate the type-safe client. In your backend directory, run:
      ```bash
      npx prisma generate
      ```
      This reads your `schema.prisma` and creates the client code in `node_modules/@prisma/client` that you'll use to interact with the database.

4.  **Create Basic Server Structure:**
    - `src/index.ts`: Main server entry point.
    - `src/routes/`: Directory for API route handlers.
    - `src/controllers/`: Directory for business logic.
    - `src/middleware/`: Directory for middleware (e.g., auth).
    - `src/prisma.ts`: To export a singleton Prisma client instance.

---

### Phase 1: User Authentication

**Goal:** Replace the frontend mock authentication with real user registration and login.

1.  **Backend Tasks:**
    - **Create Auth Controller (`authController.ts`):**
        - `register`: Hash password, create a new user in DB. Return user info and a JWT.
        - `login`: Find user, compare hashed password. Return user info and a JWT if valid.
    - **Create Auth Routes (`authRoutes.ts`):**
        - `POST /api/auth/register`
        - `POST /api/auth/login`
    - **Create User Profile Endpoint:**
        - `PUT /api/users/profile`: Update user's phone, address, and set `isProfileComplete` to true. This should be a protected route.
        - `GET /api/users/me`: Get current user's data based on JWT. This is for session persistence.
    - **Create Auth Middleware (`authMiddleware.ts`):**
        - A middleware that verifies the JWT from the `Authorization` header and attaches the user payload to the request object.

2.  **Frontend Tasks (`services/api.ts`):**
    - Create a new `services/api.ts` file.
    - Implement `registerUser`, `loginUser`, `updateUserProfile`, `getCurrentUser` functions that use `fetch` or `axios` to call your new backend endpoints.
    - In `AuthContext.tsx`, replace calls to `mockApi` with calls to your new `api.ts` functions.
    - Implement token storage (e.g., in `localStorage`) and an API client instance that automatically attaches the `Authorization: Bearer <token>` header to requests.

---

### Phase 2: Class Management

**Goal:** Allow teachers to create classes and students to join them.

1.  **Backend Tasks:**
    - **Create Class Controller (`classController.ts`):**
        - `createClass`: Generate a unique alphanumeric code, create a new class linked to the teacher (from JWT).
        - `joinClass`: Find a class by `classCode`, create a `StudentEnrollment` record.
        - `getTeacherClasses`: Get all classes created by the logged-in teacher.
        - `getStudentClasses`: Get all classes the logged-in student is enrolled in.
    - **Create Class Routes (`classRoutes.ts`):**
        - `POST /api/classes` (Protected, Teacher only)
        - `POST /api/classes/join` (Protected, Student only)
        - `GET /api/classes/teacher` (Protected, Teacher only)
        - `GET /api/classes/student` (Protected, Student only)
        - `GET /api/classes/:id` (Protected, for getting class details)

2.  **Frontend Tasks:**
    - In `api.ts`, implement functions to call the new class endpoints.
    - In `TeacherDashboard.tsx`, `StudentDashboard.tsx`, and `ClassroomPage.tsx`, replace mock data fetching with calls to your API functions.

---

### Phase 3: Real-time Classroom State

**Goal:** Replace the simulated classroom state changes with real-time updates using WebSockets.

1.  **Backend Tasks:**
    - **Integrate Socket.io:** Attach Socket.io to your HTTP server.
    - **Create Socket Logic:**
        - **Connection:** When a user connects, they should `join` a room specific to their class (e.g., `class_room_${classId}`).
        - **Teacher Events:** Create handlers for events emitted by the teacher's client.
            - On `teacher:start-class`: Broadcast a `class:state-changed` event with payload `{ status: 'MAIN_SESSION' }` to the class room.
            - On `teacher:activate-groups`: Broadcast `class:state-changed` with `{ status: 'GROUP_SESSION' }`.
            - On `teacher:end-class`: Broadcast `class:state-changed` with `{ status: 'POSTTEST' }`.
        - **Chat:** Handle `chat:send-message` events and broadcast `chat:receive-message` to the appropriate room (main class room or mini-group room).

2.  **Frontend Tasks:**
    - **Install Client:** `npm install socket.io-client`.
    - **Create `SocketContext.tsx`:**
        - Establish a WebSocket connection.
        - Provide functions to emit events (`sendMessage`, `changeClassState`).
        - Provide a mechanism to listen for incoming events.
    - **Refactor `ClassroomPage.tsx`:**
        - Remove the `handleTeacherControl` state simulation.
        - Use the `SocketContext` to emit teacher actions.
        - Listen for `class:state-changed` events and update the local `classStatus` state accordingly.

---

### Phase 4: Quizzes, Content, and Analytics

**Goal:** Persist quizzes, materials, student answers, and group collaboration notes.

1.  **Backend Tasks:**
    - **Content Management:** Create controllers and routes for uploading/managing materials (PDFs, YouTube links).
    - **Quiz Controller:**
        - `updateQuiz`: Allow teachers to create/update Pre- and Post-tests with questions.
        - `getQuiz`: Fetch a quiz for a student to take.
        - `submitQuiz`: Record student answers, calculate the score, and save it in `StudentEnrollment`.
    - **Analytics Controller:**
        - `getClassAnalytics`: Aggregate and return Pre/Post-test scores for all students in a class.
    - **Group Note Handling (via Sockets):**
        - On a `note:update` event, save the note content to the `GroupNote` table and broadcast the new content to the other members of that mini-group.

2.  **Frontend Tasks:**
    - **API Calls:** Implement functions in `api.ts` for all content, quiz, and analytics endpoints.
    - **Page Integration:** Connect `ManageClassContentPage`, `ManageQuizzesPage`, and `PerformanceAnalyticsPage` to their respective API endpoints.
    - **Quiz Flow:** Connect `PretestView` and `PosttestView` to fetch questions and submit answers via the API.
    - **Shared Notes:** Modify `SharedNotes` to use sockets for real-time updates.

---

### Phase 5: Secure AI Proxy

**Goal:** Protect the Gemini API key by moving AI calls to the backend.

1.  **Backend Tasks:**
    - **Create AI Controller (`aiController.ts`):**
        - Create a function `getAIResponse`. It should receive a prompt from the client.
        - It will initialize the `GoogleGenAI` client using the `API_KEY` from your server's `.env` file.
        - It will call `ai.models.generateContent` and return the response text to the client.
    - **Create AI Route:**
        - `POST /api/ai/query`: A protected route that takes a prompt and calls the `aiController` function.

2.  **Frontend Tasks:**
    - **Modify `geminiService.ts`:**
        - Remove the direct call to `@google/genai`.
        - Change `getAIResponse` to make a `fetch` request to your new `/api/ai/query` backend endpoint.
    - **Environment Variable:** You can now remove the `API_KEY` from the frontend `.env` file.

---

### Complete Prisma Schema (for reference)
This schema corresponds to the `schema.sql` file. Place this in `prisma/schema.prisma` and run `npx prisma generate`.

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
  password          String
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
```
By following this phased plan, you will systematically build a robust backend that brings the full functionality of the BioLearn AI frontend to life.
