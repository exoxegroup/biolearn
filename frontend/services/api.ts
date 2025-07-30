import { User, UserRole, Gender } from '../types';

const BASE_URL = 'http://localhost:3001/api'; // Your backend server URL

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
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const loginUser = async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
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
  const response = await fetch(`${BASE_URL}/users/profile`, {
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
  const response = await fetch(`${BASE_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name: className }),
  });
  const newClass = await handleResponse(response);
  return {
    id: newClass.id,
    name: newClass.name,
    classCode: newClass.classCode,
    teacherName: '', // We'll fetch this if needed, or derive from current user
    studentCount: 0,
  };
};

export const getTeacherClasses = async (token: string): Promise<ClassSummary[]> => {
  const response = await fetch(`${BASE_URL}/classes`, {
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
  const response = await fetch(`${BASE_URL}/materials/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const addMaterial = async (classId: string, formData: FormData, token: string) => {
  const response = await fetch(`${BASE_URL}/materials/${classId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const deleteMaterial = async (materialId: string, token: string) => {
  const response = await fetch(`${BASE_URL}/materials/${materialId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getClassDetails = async (classId: string, token: string) => {
  const response = await fetch(`${BASE_URL}/classes/${classId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getStudentClasses = async (token: string): Promise<ClassSummary[]> => {
  const response = await fetch(`${BASE_URL}/enrollments/student`, {
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
  const response = await fetch(`${BASE_URL}/enrollments`, {
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
  const response = await fetch(`${BASE_URL}/quizzes/pretest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ classId, answers }),
  });
  return handleResponse(response);
};
