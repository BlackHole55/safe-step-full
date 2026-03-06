export interface Option {
  id: number;
  text: string;
  next_step_id: number;
  is_correct: boolean;
  feedback: string;
}

export interface Step {
  id: number;
  slug: string;
  title: string;
  description: string; 
  time_limit: number | null;
  options: Option[];
}

export interface SimulationResponse {
  session_uuid: string;
  step: Step;
}

export interface AnswerResponse {
  feedback: string;
  is_correct: boolean;
  next_step: Step;
  is_victory: boolean;
  is_finished: boolean;
  total_score: number;
  score_percentage: number;
}

export interface Feedback {
  message: string; 
  isCorrect: boolean;
}

export interface FinalResult {
  score: number; 
  score_percentage: number; 
  isVictory: boolean;
}