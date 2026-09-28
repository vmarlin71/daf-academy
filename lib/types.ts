export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type LessonSection = {
  title: string
  body: string
  bullets?: string[]
  formula?: string
  example?: string
}

export type Module = {
  slug: string
  level: number
  order: number
  title: string
  description: string
  duration: number
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  available: boolean
  objectives?: string[]
  sections?: LessonSection[]
  quiz?: QuizQuestion[]
}

export type ProgressRecord = {
  moduleSlug: string
  lessonRead: boolean
  bestScore: number
  attempts: number
  completed: boolean
  updatedAt: string
}
