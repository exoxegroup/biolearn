
export type UserRole = "TEACHER" | "STUDENT";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender: Gender;
  phone?: string;
  address?: string;
  isProfileComplete: boolean;
}

export interface ClassSummary {
  id: string;
  name: string;
  classCode: string;
  teacherName: string;
  studentCount: number;
}

export interface ClassDetails extends ClassSummary {
    materials: Material[];
    students: EnrolledStudent[];
    pretest: Quiz;
    posttest: Quiz;
    posttestUsesPretestQuestions: boolean;
    teacher: {
        id: string;
        name: string;
    };
}

export interface Material {
    id: string;
    type: 'pdf' | 'docx' | 'youtube';
    title: string;
    url: string;
}

export interface EnrolledStudent {
    id:string;
    name: string;
    gender: Gender;
    pretestStatus: 'TAKEN' | 'NOT_TAKEN';
    pretestScore: number | null;
    posttestScore: number | null;
    groupNumber: number | null;
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface Quiz {
    id: string;
    title: string;
    timeLimitMinutes: number;
    questions: QuizQuestion[];
}

export interface GroupNote {
    id: string;
    groupId: number;
    content: string;
    lastUpdated: string;
}

export type ClassroomStatus = 'PRETEST' | 'WAITING_ROOM' | 'MAIN_SESSION' | 'GROUP_SESSION' | 'POSTTEST' | 'ENDED';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderId: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}
