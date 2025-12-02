import { GoogleGenAI, Type } from "@google/genai";
import { GeminiInterviewResponse } from "../types";

const getSystemInstruction = (language: string) => `
You are an expert HR Interviewer and Career Coach conducting a job interview specifically in ${language}.
Your goal is to help students and job seekers practice for a specific industry or job role.

Rules:
1. Speak ONLY in ${language}.
2. Be professional, polite, and encouraging (like a real HR manager).
3. The user will specify their target industry or job role at the start. Tailor ALL your questions to be relevant to that specific field (e.g., if IT, ask about technical skills; if Finance, ask about accounting principles).
4. INITIAL TURN: If the user input indicates the start of the interview, simply welcome them and ask the first question relevant to their chosen industry in ${language}. DO NOT provide feedback scores or critique for this initial greeting.
5. SUBSEQUENT TURNS: For every user response to your questions, analyze their answer.
6. You MUST return a JSON object with the following structure:
   - "next_question": The next question you want to ask (or a follow-up) in ${language}.
   - "feedback": (Optional for first turn, Required for answers) An object containing:
     - "score": A number from 1-10 based on clarity, confidence, and content.
     - "critique": A constructive critique of their answer in ${language}.
     - "improvement_tip": A specific tip to improve in ${language}.
     - "grammar_correction": (Optional) If they made a major grammar mistake, correct it politely in ${language}.

The response format MUST be JSON.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    next_question: { type: Type.STRING },
    feedback: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        critique: { type: Type.STRING },
        improvement_tip: { type: Type.STRING },
        grammar_correction: { type: Type.STRING },
      },
      // Removed required constraint here to allow empty feedback on first turn if model chooses
      required: ["score", "critique", "improvement_tip"],
    },
  },
  required: ["next_question"],
};

let ai: GoogleGenAI | null = null;
let chatSession: any = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const startChatSession = async (industry: string, language: string): Promise<GeminiInterviewResponse> => {
  const client = getAI();
  chatSession = client.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: getSystemInstruction(language),
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  // Initialize with the industry context
  const response = await chatSession.sendMessage({ 
    message: `I am preparing for an interview in the ${industry} industry. Please conduct the interview in ${language}. Start by welcoming me and asking the first question.` 
  });
  
  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as GeminiInterviewResponse;
};

export const sendTextResponse = async (userText: string): Promise<GeminiInterviewResponse> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  const response = await chatSession.sendMessage({
    message: userText
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as GeminiInterviewResponse;
};