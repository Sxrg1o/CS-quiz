export enum AnswerType {
    UNIQUE_ANSWER = "respuesta_unica",
    MULTIPLE_ANSWERS = "respuesta_multiple",
  }
  
  export enum QuestionType {
    CONCEPTUAL = "conceptual",
    PRACTICAL = "practica",
    THEORETICAL = "teorica",
    PROBLEM_SOLVING = "solucion_de_problemas",
  }
  
  export interface Option {
    label: string
    answer: boolean
  }
  
  export interface Reference {
    type: string
    citation: string
    pages?: string
    url?: string
  }
  
  export interface QuestionMetadata {
    topic: string
    subtopic: string
    difficulty: number
    tags: string[]
  }
  
  export interface QuizQuestion {
    question: string
    clues: string[]
    questionType: QuestionType
    answerType: AnswerType
    options: Option[]
    metadata: QuestionMetadata
    summary?: string
    references: Reference[]
  }
  
  export interface QuestionParameters {
    topic: string
    subtopic: string
    difficulty: number
    question_type: QuestionType
    response_type: AnswerType
    options_count: number
    clues_count: number
  }
  