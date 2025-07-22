
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please check your .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = "gemini-2.5-flash";

export const getAIResponse = async (prompt: string, chatHistory: { role: string, parts: { text: string }[] }[]): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key not configured. Please contact the administrator.";
  }

  try {
    const chat = ai.chats.create({
      model,
      // The history feature is not used in the final version of this code to keep it simple,
      // but the structure is here for future expansion. The prompt is self-contained.
      history: [], 
      config: {
        systemInstruction: "You are BioLearn AI, a helpful and encouraging AI assistant for high school biology students in Nigeria. Your purpose is to help students explore concepts, brainstorm ideas for their group work, and clarify complex topics. Explain things simply. Do not give direct answers to test questions. Instead, guide them to think for themselves. Keep responses concise and focused."
      }
    });

    const response = await chat.sendMessage({ message: prompt });
    
    return response.text;

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "There is an issue with the AI service configuration. Please notify your teacher.";
    }
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
};
