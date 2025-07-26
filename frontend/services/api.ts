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
