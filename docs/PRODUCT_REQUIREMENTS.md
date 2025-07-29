# Production Requirements Document (PRD): BioLearn AI Platform

**Version:** 1.0
**Date:** July 22, 2025
**Author:** Project Lead
**Status:** Draft

## 1. Executive Summary

This document outlines the production requirements for "BioLearn AI," a specialized web application designed to replicate and enhance core features of Google Classroom. The platform is targeted at Biology pre-service teachers and their students in North-East Nigeria.

The primary purpose of BioLearn AI is to serve as a tool for a research study investigating the impact of Artificial Intelligence on collaborative learning. It will facilitate teacher-led instruction, resource sharing, real-time communication (chat, video), and group-based collaboration. The platform's core differentiator is the integration of an AI assistant within small-group breakout sessions to aid in note-taking and concept exploration.

The project will measure the AI's effect on academic achievement, knowledge retention, and student engagement, with a specific analytical focus on gender-based differences in these outcomes.

## 2. Research Objectives & Success Metrics

The success of this platform is directly tied to its ability to collect data for the following research objectives.

| Objective                                                                 | Key Success Metric(s) to be Measured by the Platform                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Determine AI platform’s impact on academic achievement.                   | Delta between Pretest and Posttest scores for each student. Aggregated scores per class.                             |
| Examine AI platform’s effect on knowledge retention.                      | (Assumes a follow-up test) System must store and allow comparison of Posttest scores with scores from a later date. |
| Assess engagement levels when using the AI platform.                      | - Time spent in main classroom vs. mini-group.<br>- Number of chat messages sent (student-student, student-teacher).<br>- Number of AI interactions/queries per group. |
| Analyze gender influence on academic achievement with AI.                 | Comparison of male vs. female Pretest/Posttest score deltas.                                                       |
| Compare male vs. female knowledge retention using AI.                     | Comparison of male vs. female Posttest scores over time.                                                           |
| Compare engagement levels by gender in collaborative AI-enabled settings. | Comparison of male vs. female engagement metrics (time, chat counts, AI usage).                                    |

## 3. User Personas

### A. Teacher Persona: Mr. Bello
*   **Role:** Educator for pre-service Biology teachers.
*   **Goal:** To effectively deliver his curriculum, foster collaboration among his students, and easily track their progress and understanding of complex topics.
*   **Pain Points:** Limited resources for interactive digital tools, difficulty in managing and monitoring group work simultaneously, and a need for objective data on student performance.

### B. Student Persona: Amina
*   **Role:** Pre-service Biology teacher (student).
*   **Goal:** To understand the course material, collaborate effectively with her peers, and get support where needed to improve her academic performance.
*   **Pain Points:** Hesitancy to ask questions in a large class, difficulty coordinating with group members, and a desire for more interactive ways to learn beyond static PDFs.

## 4. User Flow Diagrams

### A. Onboarding & Profile Completion Flow
1.  User lands on Welcome Page.
2.  User clicks "Sign Up" -> Enters Name, Email, Password, Confirm Password, Gender -> Clicks "Register".
3.  User clicks "Login" -> Enters Email, Password -> Clicks "Login".
4.  **System Check:** Is user profile complete (Role, Phone, Address)?
    *   **NO:** User is redirected to a mandatory "Complete Profile" page. Upon submission, they are redirected to their dashboard.
    *   **YES:** User is redirected directly to their role-specific dashboard (Teacher or Student).

### B. Teacher's Class Lifecycle Flow
1.  Teacher logs in -> Lands on Teacher Dashboard.
2.  Creates a new Class -> A unique Class Code is generated.
3.  Inside the Class settings:
    *   Uploads learning materials (`.pdf`, `.docx`).
    *   Embeds YouTube video links.
    *   Creates Pretest and Posttest (MCQs, correct answers, time limits).
    *   Views enrolled students and assigns them to mini-groups.
4.  Class Day: Teacher enters the virtual classroom.
5.  Monitors student list and sees who has/hasn't completed the Pretest.
6.  Uses video/chat to prompt remaining students to take the Pretest.
7.  Once all students are online and have taken the Pretest, Teacher clicks **"Start Class"**. A "Class Started" status is visible to all.
8.  Teacher lectures/introduces the topic.
9.  Teacher clicks **"Activate Group Stage"**.
10. All students are automatically moved from the main classroom to their assigned mini-group rooms.
11. Teacher can navigate between mini-groups to observe their chat, video call, and shared notes.
12. Teacher clicks **"End Group Stage"**.
13. All students are automatically returned to the main classroom.
14. Teacher can view the notes created by each group and uses them to guide the final lecture/discussion.
15. Teacher clicks **"End Class"**.
16. All students are automatically redirected to the Posttest page.
17. Teacher can view Pretest/Posttest analytics on their dashboard.

### C. Student's Class Lifecycle Flow
1.  Student logs in -> Lands on Student Dashboard.
2.  Clicks "Join Class" -> Enters the unique Class Code provided by the teacher.
3.  Enters the newly enrolled Class.
4.  Is immediately prompted to take the mandatory, timed **Pretest**.
5.  Upon Pretest completion, enters the main virtual classroom waiting for the class to start.
6.  Listens to the teacher's initial instruction.
7.  When the teacher activates groups, the student is automatically moved to a **mini-group room** with their assigned peers.
8.  In the mini-group:
    *   Collaborates via video, audio, and text chat.
    *   Uses the integrated **AI Assistant** to ask questions and generate ideas.
    *   Contributes to a shared, real-time "Group Notes" document.
9.  When the teacher ends the group stage, the student is automatically returned to the main classroom.
10. Participates in the final class discussion.
11. When the teacher ends the class, the student is automatically redirected to the timed **Posttest** page.
12. Upon Posttest completion, the student can view their Pretest and Posttest scores on their dashboard.

## 5. Functional Requirements

#### 5.1 User Management & Authentication
*   **FR-101:** Users must be able to sign up with Name, Email, Password, and Gender.
*   **FR-102:** Users must be able to log in using their email and password.
*   **FR-103:** System shall support Google OAuth for one-click sign-up/login, automatically collecting name and email, and prompting for Gender and Role on first login.
*   **FR-104:** On first login after registration, the system must check for an incomplete profile (Role, Phone Number, Address) and force the user to complete it before proceeding.
*   **FR-105:** The system must differentiate between two roles: "Teacher" and "Student," serving a different dashboard for each.

#### 5.2 Teacher Features
*   **FR-201 (Class Management):** A teacher must be able to create, edit, and delete classes. Each new class must automatically generate a unique, shareable alphanumeric code.
*   **FR-202 (Resource Management):** In each class, a teacher must be able to upload `.pdf` and `.docx` files and embed YouTube videos via URL.
*   **FR-203 (Quiz Management):** A teacher must be able to create a Pretest and a Posttest for each class. This includes creating multiple-choice questions, marking the correct answer, and setting a time limit for the quiz.
*   **FR-204 (Quiz Re-use):** A teacher must have the option to use the same set of questions for the Posttest as the Pretest.
*   **FR-205 (Student Management):** A teacher must be able to view a list of all students enrolled in a class and assign them to numbered mini-groups (e.g., Group 1, Group 2).
*   **FR-206 (Real-time Monitoring):** From the classroom view, a teacher must see a list of currently online students and their Pretest completion status.
*   **FR-207 (Class Control):** A teacher must have buttons to **"Start Class"**, **"Activate Group Stage"**, **"End Group Stage"**, and **"End Class"**.
*   **FR-208 (Group Observation):** When groups are active, the teacher must be able to join/observe any mini-group to see their video/chat and the notes they are creating.
*   **FR-209 (Note Review):** After the group stage ends, the teacher must be able to access and review the notes created by each individual group.
*   **FR-210 (Performance Analytics):** The teacher dashboard must display Pretest and Posttest scores for every student in a class.

#### 5.3 Student Features
*   **FR-301 (Class Enrollment):** A student must be able to join a class by entering a unique class code.
*   **FR-302 (Dashboard):** The student dashboard must list all classes they are enrolled in.
*   **FR-303 (Mandatory Pretest):** Upon entering a class for the first time, a student must be required to take the Pretest before they can enter the main classroom.
*   **FR-304 (Automated Navigation):** The student's interface must automatically navigate them between the main classroom and their assigned mini-group based on the teacher's controls.
*   **FR-305 (Collaborative Note-taking):** Inside a mini-group, students must have access to a shared text editor to create group notes. These notes must be saved and be viewable by the teacher.
*   **FR-306 (AI Assistant):** The chat interface within the mini-group must include a feature to query an AI chatbot. The AI should not be available in the main classroom.
*   **FR-307 (Mandatory Posttest):** When the teacher ends the class, students must be automatically directed to complete the Posttest.
*   **FR-308 (Score Reporting):** The student dashboard must display the student's own Pretest and Posttest scores for each completed class, along with a status (e.g., "Completed," "Not Taken").

#### 5.4 Shared & Real-time Features
*   **FR-401 (Communication):** All users (teachers and students) must have access to real-time video, audio, and text chat within the main classroom and within their respective mini-groups (Implementation via Jitsi).
*   **FR-402 (Presence):** The system must display the online/offline status of users within a classroom context.
*   **FR-403 (Data Persistence):** All quiz scores, user profiles, class materials, and group notes must be persistently stored in the database.

## 6. Non-Functional Requirements

*   **NFR-1 (Performance):** The application must be responsive. Page loads should be under 3 seconds. Real-time chat and video must have low latency, assuming adequate user bandwidth.
*   **NFR-2 (Usability):** The UI must be clean, intuitive, and easy to navigate for users with varying levels of technical literacy.
*   **NFR-3 (Security):** All user data, especially personal information and academic scores, must be securely stored. Passwords must be hashed. Communication channels should be encrypted.
*   **NFR-4 (Scalability):** The application architecture should be able to handle the projected number of users for the study and allow for future scaling if necessary.
*   **NFR-5 (Reliability):** The platform should have high availability during scheduled class times. Quiz and note data must be saved reliably to prevent data loss.
*   **NFR-6 (Browser Compatibility):** The application must be fully functional on the latest versions of major web browsers: Google Chrome, Mozilla Firefox, and Microsoft Edge.

## 7. Technology Stack

| Frontend | `Next.js` + `React` |
| Backend | `Node.js` + `Express` |
| Database | `PostgreSQL` |
| ORM | `Prisma` |
| Authentication | `NextAuth` (Google OAuth) |
| Real-time (Presence/Chat) | `Socket.io` |
| Video/Audio Calls | `Jitsi` (free) |
| AI/Chatbot | OpenAI `GPT-4` / Google `Gemini` free models |
| Deployment | `Render.com` |
| DB Management | `TablePlus` |

## 8. Assumptions and Constraints

*   **Constraint:** To minimize server load and costs, media content (videos) will not be hosted on the platform. All video content will be embedded from YouTube.
*   **Constraint:** The AI chatbot integration will rely on the free tiers or initial credits provided by OpenAI/Google. Usage will be monitored to stay within limits.
*   **Assumption:** The target users in North-East Nigeria may have varying internet quality. The application should be designed to be as lightweight as possible.
*   **Assumption:** All participants will have access to a computer with a modern web browser, a microphone/camera, and a stable internet connection.

## 9. Out of Scope for Version 1.0

*   Native mobile applications (iOS/Android).
*   Administrative back-office for super-users.
*   Payment gateways or subscription models.
*   Public-facing marketing website.
*   Advanced analytics beyond the scope of the research objectives.
*   Asynchronous communication (e.g., forums, email notifications).
