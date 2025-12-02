export interface InterviewState {
  isStarted: boolean;
  isLoading: boolean;
  error: string | null;
  history: Message[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  feedback?: Feedback;
}

export interface Feedback {
  score: number;
  critique: string;
  improvementTip: string;
  grammarCorrection?: string;
}

// Defined structure for the Gemini JSON response
export interface GeminiInterviewResponse {
  next_question: string;
  feedback?: {
    score: number;
    critique: string;
    improvement_tip: string;
    grammar_correction?: string;
  };
}