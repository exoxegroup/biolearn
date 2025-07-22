
import { User, ClassSummary, ClassDetails, UserRole, Gender, EnrolledStudent, Quiz, QuizQuestion, ChatMessage, Material } from '../types';

// --- Mock Database ---

let mockUsers: User[] = [
  { id: 'user-1', name: 'Mr. Bello', email: 'teacher@biolearn.com', role: 'TEACHER', gender: 'MALE', isProfileComplete: true },
  { id: 'user-2', name: 'Amina', email: 'student@biolearn.com', role: 'STUDENT', gender: 'FEMALE', isProfileComplete: true },
  { id: 'user-3', name: 'John Doe', email: 'newstudent@biolearn.com', role: 'STUDENT', gender: 'MALE', isProfileComplete: false, phone: '', address: '' },
  { id: 'user-4', name: 'Binta Ahmed', email: 'binta@example.com', role: 'STUDENT', gender: 'FEMALE', isProfileComplete: true },
  { id: 'user-5', name: 'Chinedu Okoro', email: 'chinedu@example.com', role: 'STUDENT', gender: 'MALE', isProfileComplete: true },
  { id: 'user-6', name: 'Fatima Garba', email: 'fatima@example.com', role: 'STUDENT', gender: 'FEMALE', isProfileComplete: true },
  { id: 'user-7', name: 'Musa Ibrahim', email: 'musa@example.com', role: 'STUDENT', gender: 'MALE', isProfileComplete: true },
  { id: 'user-8', name: 'Ngozi Eze', email: 'ngozi@example.com', role: 'STUDENT', gender: 'FEMALE', isProfileComplete: true },
  { id: 'user-9', name: 'Sani Bello', email: 'sani@example.com', role: 'STUDENT', gender: 'MALE', isProfileComplete: true },
  { id: 'user-10', name: 'Zainab Mohammed', email: 'zainab@example.com', role: 'STUDENT', gender: 'FEMALE', isProfileComplete: true },
  { id: 'user-11', name: 'Emeka Nwosu', email: 'emeka@example.com', role: 'STUDENT', gender: 'MALE', isProfileComplete: true },
];

const mockQuizQuestions: QuizQuestion[] = [
    { id: 'q1', text: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'], correctAnswerIndex: 1 },
    { id: 'q2', text: 'Which of these is responsible for photosynthesis?', options: ['Mitochondria', 'Golgi Apparatus', 'Chloroplast', 'Vacuole'], correctAnswerIndex: 2 },
    { id: 'q3', text: 'What does DNA stand for?', options: ['Deoxyribonucleic Acid', 'Denitromonic Acid', 'Deoxyribosomic Nucleotide', 'Di-ribonucleic Acid'], correctAnswerIndex: 0 },
];

const mockPretest: Quiz = { id: 'pretest-1', title: 'Biology Basics Pre-Test', timeLimitMinutes: 10, questions: mockQuizQuestions };
const mockPosttest: Quiz = { id: 'posttest-1', title: 'Biology Basics Post-Test', timeLimitMinutes: 10, questions: mockQuizQuestions };


let mockClasses: ClassDetails[] = [
    {
        id: 'class-1',
        name: 'Advanced Cell Biology',
        classCode: 'XYZ123',
        teacherName: 'Mr. Bello',
        studentCount: 10,
        materials: [
            { id: 'mat-1', type: 'pdf', title: 'Cell Structure Notes.pdf', url: '#' },
            { id: 'mat-2', type: 'youtube', title: 'Introduction to Cells', url: 'https://www.youtube.com/embed/8IlzKri08kk' },
        ],
        students: [
            { id: 'user-2', name: 'Amina', gender: 'FEMALE', pretestStatus: 'TAKEN', pretestScore: 5, posttestScore: 8, groupNumber: 1 },
            { id: 'user-4', name: 'Binta Ahmed', gender: 'FEMALE', pretestStatus: 'TAKEN', pretestScore: 6, posttestScore: 9, groupNumber: 1 },
            { id: 'user-9', name: 'Sani Bello', gender: 'MALE', pretestStatus: 'TAKEN', pretestScore: 4, posttestScore: 7, groupNumber: 1 },
            { id: 'user-5', name: 'Chinedu Okoro', gender: 'MALE', pretestStatus: 'TAKEN', pretestScore: 3, posttestScore: 3, groupNumber: 2 },
            { id: 'user-6', name: 'Fatima Garba', gender: 'FEMALE', pretestStatus: 'TAKEN', pretestScore: 7, posttestScore: 6, groupNumber: 2 },
            { id: 'user-8', name: 'Ngozi Eze', gender: 'FEMALE', pretestStatus: 'TAKEN', pretestScore: 8, posttestScore: 10, groupNumber: 2 },
            { id: 'user-7', name: 'Musa Ibrahim', gender: 'MALE', pretestStatus: 'TAKEN', pretestScore: 5, posttestScore: 8, groupNumber: 3 },
            { id: 'user-10', name: 'Zainab Mohammed', gender: 'FEMALE', pretestStatus: 'TAKEN', pretestScore: 4, posttestScore: 7, groupNumber: 3 },
            { id: 'user-11', name: 'Emeka Nwosu', gender: 'MALE', pretestStatus: 'TAKEN', pretestScore: 9, posttestScore: 9, groupNumber: 3 },
            { id: 'user-3', name: 'John Doe', gender: 'MALE', pretestStatus: 'TAKEN', pretestScore: 2, posttestScore: 5, groupNumber: null },
        ],
        pretest: mockPretest,
        posttest: mockPosttest,
        posttestUsesPretestQuestions: false,
    }
];

// --- Mock API Functions ---

const simulateDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data))); // Deep copy to prevent mutation issues
    }, 500);
  });
};

export const mockLogin = async (email: string): Promise<User | null> => {
  const user = mockUsers.find(u => u.email === email);
  return simulateDelay(user || null);
};

export const mockRegister = async (name: string, email: string, role: UserRole, gender: Gender): Promise<User> => {
    const newUser: User = { id: `user-${Date.now()}`, name, email, role, gender, isProfileComplete: false };
    mockUsers.push(newUser);
    return simulateDelay(newUser);
}

export const mockUpdateProfile = async (userId: string, data: { phone: string; address: string }): Promise<User> => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
        user.phone = data.phone;
        user.address = data.address;
        user.isProfileComplete = true;
    }
    return simulateDelay(user!);
}

export const mockCreateClass = async (teacherId: string, className: string): Promise<ClassSummary> => {
    const teacher = mockUsers.find(u => u.id === teacherId);
    if (!teacher) {
        throw new Error("Teacher not found");
    }

    const newClass: ClassDetails = {
        id: `class-${Date.now()}`,
        name: className,
        classCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        teacherName: teacher.name,
        studentCount: 0,
        materials: [],
        students: [],
        pretest: { id: `pretest-${Date.now()}`, title: 'New Pre-Test', timeLimitMinutes: 10, questions: [] },
        posttest: { id: `posttest-${Date.now()}`, title: 'New Post-Test', timeLimitMinutes: 10, questions: [] },
        posttestUsesPretestQuestions: false,
    };

    mockClasses.push(newClass);

    const summary: ClassSummary = {
        id: newClass.id,
        name: newClass.name,
        classCode: newClass.classCode,
        teacherName: newClass.teacherName,
        studentCount: newClass.studentCount,
    };

    return simulateDelay(summary);
}

export const mockGetTeacherClasses = async (teacherId: string): Promise<ClassSummary[]> => {
  const classes = mockClasses.filter(c => c.teacherName === mockUsers.find(u => u.id === teacherId)?.name);
  return simulateDelay(classes.map(({ id, name, classCode, teacherName, studentCount }) => ({ id, name, classCode, teacherName, studentCount })));
};

export const mockGetStudentClasses = async (studentId: string): Promise<ClassSummary[]> => {
    const classes = mockClasses.filter(c => c.students.some(s => s.id === studentId));
    return simulateDelay(classes.map(({ id, name, classCode, teacherName, studentCount }) => ({ id, name, classCode, teacherName, studentCount })));
};

export const mockGetClassDetails = async (classId: string, userId?: string): Promise<ClassDetails | null> => {
    const classDetail = mockClasses.find(c => c.id === classId);
    if (!classDetail) return simulateDelay(null);

    // Simulate student joining a class they just entered via code
    const user = userId ? mockUsers.find(u => u.id === userId) : null;
    if (user && user.role === 'STUDENT') {
        const isEnrolled = classDetail.students.some(s => s.id === userId);
        if (!isEnrolled) {
            const newStudent: EnrolledStudent = { id: user.id, name: user.name, gender: user.gender, pretestStatus: 'NOT_TAKEN', pretestScore: null, posttestScore: null, groupNumber: null };
            classDetail.students.push(newStudent);
            classDetail.studentCount++;
        }
    }

    return simulateDelay(classDetail);
}

export const mockAddMaterial = async (classId: string, material: { type: 'pdf' | 'docx' | 'youtube'; title: string; url: string; }): Promise<Material> => {
    const classDetail = mockClasses.find(c => c.id === classId);
    if (!classDetail) throw new Error("Class not found");
    
    // In a real app, the URL for files would point to a storage location.
    // For youtube, we ensure it's an embed link.
    let finalUrl = material.url;
    if (material.type === 'youtube' && !material.url.includes('embed')) {
        const videoId = material.url.split('v=')[1]?.split('&')[0] || material.url.split('/').pop();
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const newMaterial: Material = {
        id: `mat-${Date.now()}`,
        type: material.type,
        title: material.title,
        url: finalUrl,
    };

    classDetail.materials.unshift(newMaterial);
    return simulateDelay(newMaterial);
}

export const mockDeleteMaterial = async (classId: string, materialId: string): Promise<{ success: boolean }> => {
    const classDetail = mockClasses.find(c => c.id === classId);
    if (!classDetail) throw new Error("Class not found");

    const initialLength = classDetail.materials.length;
    classDetail.materials = classDetail.materials.filter(m => m.id !== materialId);
    const success = classDetail.materials.length < initialLength;

    return simulateDelay({ success });
}

export const mockUpdateQuiz = async (classId: string, quizType: 'pretest' | 'posttest', quizData: Quiz): Promise<Quiz> => {
    const classDetail = mockClasses.find(c => c.id === classId);
    if (!classDetail) throw new Error("Class not found");

    if (quizType === 'pretest') {
        classDetail.pretest = quizData;
    } else {
        classDetail.posttest = quizData;
    }
    
    return simulateDelay(quizData);
};

export const mockSetPosttestReuse = async (classId: string, reuse: boolean): Promise<{ success: boolean }> => {
    const classDetail = mockClasses.find(c => c.id === classId);
    if (!classDetail) throw new Error("Class not found");
    classDetail.posttestUsesPretestQuestions = reuse;
    return simulateDelay({ success: true });
}

export const mockAssignStudentsToGroups = async (classId: string, assignments: { studentId: string, groupNumber: number | null }[]): Promise<{ success: boolean }> => {
    const classDetail = mockClasses.find(c => c.id === classId);
    if (!classDetail) {
        throw new Error("Class not found");
    }

    assignments.forEach(assignment => {
        const student = classDetail.students.find(s => s.id === assignment.studentId);
        if (student) {
            student.groupNumber = assignment.groupNumber;
        }
    });

    return simulateDelay({ success: true });
};

export const mockSetPretestTaken = (classId: string, studentId: string) => {
    const classDetail = mockClasses.find(c => c.id === classId);
    const student = classDetail?.students.find(s => s.id === studentId);
    if (student) {
        student.pretestStatus = 'TAKEN';
    }
}

export const mockGetInitialChatMessages = async (): Promise<ChatMessage[]> => {
  return simulateDelay([]);
}

export const mockGetGroupNotes = async (classId: string, groupId: number): Promise<string> => {
    // In a real app this would be persisted. Here we just return a default string.
    return simulateDelay(`# Group ${groupId} Notes for Class ${classId}\n\n- Start brainstorming here...`);
}
