import { User, UserRole, Gender } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'; // Your backend server URL

interface ApiError {
  message: string;
}

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    const error: ApiError = data;
    throw new Error(error.message || 'An unknown error occurred');
  }
  return data;
};

export const registerUser = async (userData: { name: string; email: string; password: string; role: UserRole, gender: Gender }) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const loginUser = async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const updateUserProfile = async (
  profileData: { phone: string; address: string },
  token: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

import { ClassSummary } from '../types';

export const createClass = async (className: string, token: string): Promise<ClassSummary> => {
  const response = await fetch(`${API_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name: className }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create class');
  }
  
  const newClass = await response.json();
  return {
    id: newClass.id,
    name: newClass.name,
    classCode: newClass.classCode,
    teacherName: '', // We'll fetch this if needed, or derive from current user
    studentCount: 0,
  };
};

export const getTeacherClasses = async (token: string): Promise<ClassSummary[]> => {
  const response = await fetch(`${API_URL}/classes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const classes = await handleResponse(response);
  return classes.map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    classCode: cls.classCode,
    teacherName: '', // Derive or fetch as needed
    studentCount: 0, // In real app, count enrollments
  }));
};

export const getClassMaterials = async (classId: string, token: string) => {
  const response = await fetch(`${API_URL}/materials/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const addMaterial = async (classId: string, formData: FormData, token: string) => {
  const response = await fetch(`${API_URL}/materials/${classId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const deleteMaterial = async (materialId: string, token: string) => {
  const response = await fetch(`${API_URL}/materials/${materialId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getClassDetails = async (classId: string, token: string) => {
  const response = await fetch(`${API_URL}/classes/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getStudentClasses = async (token: string): Promise<ClassSummary[]> => {
  const response = await fetch(`${API_URL}/enrollments/student`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const classes = await handleResponse(response);
  return classes.map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    classCode: cls.classCode,
    teacherName: cls.teacherName,
    studentCount: cls.studentCount,
  }));
};

export const enrollInClass = async (classCode: string, token: string) => {
  const response = await fetch(`${API_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ classCode }),
  });
  return handleResponse(response);
};

export const submitPretest = async (classId: string, answers: (number | null)[], token: string) => {
  const response = await fetch(`${API_URL}/quizzes/pretest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ classId, answers }),
  });
  return handleResponse(response);
};

// Quiz Management APIs
export const updateQuiz = async (classId: string, quizData: {
  title: string;
  timeLimitMinutes: number;
  questions: Array<{
    text: string;
    options: string[];
    correctAnswerIndex: number;
  }>;
  quizType: 'PRETEST' | 'POSTTEST';
}, token: string) => {
  const response = await fetch(`${API_URL}/quizzes/classes/${classId}/quiz`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(quizData),
  });
  return handleResponse(response);
};

export const getQuiz = async (classId: string, quizType: 'PRETEST' | 'POSTTEST', token: string) => {
  const response = await fetch(`${API_URL}/quizzes/classes/${classId}/quiz?type=${quizType}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getQuizWithAnswers = async (classId: string, quizType: 'PRETEST' | 'POSTTEST', token: string) => {
  const response = await fetch(`${API_URL}/quizzes/classes/${classId}/quiz/answers?type=${quizType}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const deleteQuiz = async (classId: string, quizType: 'PRETEST' | 'POSTTEST', token: string) => {
  const response = await fetch(`${API_URL}/quizzes/classes/${classId}/quiz?type=${quizType}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const submitQuiz = async (classId: string, answers: number[], quizType: 'PRETEST' | 'POSTTEST', token: string) => {
  const response = await fetch(`${API_URL}/quizzes/classes/${classId}/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ classId, answers, quizType }),
  });
  return handleResponse(response);
};

// Group Management APIs
export const assignStudentsToGroups = async (classId: string, assignments: { studentId: string, groupNumber: number | null }[], token: string) => {
  const response = await fetch(`${API_URL}/classes/${classId}/groups`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ groupAssignments: assignments }),
  });
  return handleResponse(response);
};

export const getGroupAssignments = async (classId: string, token: string) => {
  const response = await fetch(`${API_URL}/groups/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// AI Assistant API
export const getAIResponse = async (prompt: string, token?: string, classId?: string, groupId?: number) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Only add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/ai/ask`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, classId, groupId }),
  });
  return handleResponse(response);
};

// Chat APIs
export const getChatHistory = async (classId: string, token?: string, groupId?: number) => {
  const url = groupId 
    ? `${API_URL}/chat/history?classId=${classId}&groupId=${groupId}`
    : `${API_URL}/chat/history?classId=${classId}`;
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  return handleResponse(response);
};

export const sendChatMessage = async (classId: string, text: string, token?: string, groupId?: number) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ classId, text, groupId }),
  });
  return handleResponse(response);
};

export const deleteChatMessage = async (messageId: string, token: string) => {
  const response = await fetch(`${API_URL}/chat/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Group Notes APIs
export const getGroupNotes = async (classId: string, groupId: number, token: string) => {
  const response = await fetch(`${API_URL}/groups/${classId}/${groupId}/notes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const updateGroupNotes = async (classId: string, groupId: number, content: string, token: string) => {
  const response = await fetch(`${API_URL}/groups/${classId}/${groupId}/notes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
};
