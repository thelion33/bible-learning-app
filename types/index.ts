// Database Types
export interface Video {
  id: string
  youtube_id: string
  title: string
  description: string
  published_at: string
  thumbnail_url: string
  duration: number
  transcript?: string
  processed: boolean
  created_at: string
}

export interface Lesson {
  id: string
  video_id: string
  title: string
  summary: string
  key_themes: string[]
  scripture_references: string[]
  order_index: number
  is_published: boolean
  created_at: string
}

export interface Question {
  id: string
  lesson_id: string
  type: QuestionType
  question_text: string
  options?: string[] // For multiple choice
  correct_answer: string
  explanation?: string
  order_index: number
  xp_value: number
}

export type QuestionType = 
  | 'multiple_choice' 
  | 'fill_in_blank' 
  | 'scripture_match' 
  | 'true_false'

export interface UserProgress {
  id: string
  user_id: string
  lesson_id: string
  question_id: string
  is_correct: boolean
  attempts: number
  completed_at?: string
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_xp: number
  current_streak: number
  longest_streak: number
  lessons_completed: number
  questions_answered: number
  last_activity_date: string
  created_at: string
}

export interface LessonCompletion {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
  score: number
  total_xp_earned: number
  created_at: string
}

// API Response Types
export interface YouTubeVideoResponse {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  duration: string
}

export interface OpenAIContentResponse {
  summary: string
  keyThemes: string[]
  scriptureReferences: string[]
  questions: Array<{
    type: QuestionType
    questionText: string
    options?: string[]
    correctAnswer: string
    explanation?: string
    xpValue: number
  }>
}
