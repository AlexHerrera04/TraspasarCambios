import { User } from 'src/app/feature-admin/types/user'

// Tipos para las metas
export type GoalType = 'contenido' | 'assessment';
export type ContentOrigin = 'internal' | 'external' | 'community' | 'public';
export type GoalStatus = 'pending' | 'ongoing' | 'done' | 'expired';
export type GoalPriority = 'low' | 'medium' | 'high';

// Exportar la interfaz Quiz
export interface Quiz {
  quiz_id: string;
  content_id: number;
  questions: QuizQuestion[];
}

export interface Goal {
  id: number;
  name: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  create_date: string;
  expiration_date: string;
  hasQuiz: boolean;
  quiz_completed: boolean;
  quiz_id?: number;
  type: 'content' | 'assessment';
  user: User;
  content: number;
  quiz_score?: number;
  content_name?: string;
  user_email?: string;
  content_type: string
}

export interface Content {
  id: number;
  name: string;
  description?: string;
  type?: string;
  duration?: number;
  url?: string;
  tags?: string[];
  industry: string[];
  industry_id: number[];
  origin: ContentOrigin;
  price: string | null;
  rating: string | null;
  number_of_reviews: number | null;
  status: boolean;
  created_at: string;
  external_source?: string;
  public_image: string | null;
  is_organic: boolean;
  user: number;
  organization_level: number | null;
  function: number[];
  level: number[];
  capacity: number[];
  profile: number[];
  business_driver: number[];
  idiom: number[];
  tool: number[];
  resource_url?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
}

export interface QuizSubmission {
  answers: {
    questionId: number;
    answerId: number;
  }[];
}

export interface QuizResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
}
