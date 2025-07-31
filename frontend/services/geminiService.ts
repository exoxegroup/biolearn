
import { getAIResponse as getAIResponseFromAPI } from './api';

export const getAIResponse = async (prompt: string, chatHistory: { role: string, parts: { text: string }[] }[]): Promise<string> => {
  try {
    // Get token from localStorage or wherever it's stored
    const token = localStorage.getItem('authToken');
    if (!token) {
      return "Error: Authentication required. Please log in again.";
    }

    const response = await getAIResponseFromAPI(prompt, token);
    return response.response;

  } catch (error) {
    console.error("Error fetching from AI API:", error);
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return "Session expired. Please log in again.";
      }
      return error.message;
    }
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
};
