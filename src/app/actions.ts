"use server"

import { GeminiQuestionController } from "@/lib/gemini-controller"
import type { QuizQuestion } from "@/lib/types"
import type { PromptOptions } from "@/lib/prompt-template"

export async function generateQuestions(options: PromptOptions): Promise<{
  questions?: QuizQuestion[]
  error?: string
}> {
  try {
    console.info(`Generating ${options.count} quiz questions via server action`)

    if (options.topic) {
      console.info(`Filtering by topic: ${options.topic}`)
    }

    if (options.difficulty) {
      console.info(`Filtering by difficulty: ${options.difficulty}`)
    }

    const controller = new GeminiQuestionController()
    const questions = await controller.generateQuestions(options)

    if (!questions) {
      if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY environment variable not set")
        return { error: "GOOGLE_API_KEY environment variable not set" }
      }

      console.error("Failed to generate questions")
      return { error: "Failed to generate questions" }
    }

    console.info(`Successfully generated ${questions.length} questions`)
    return { questions }
  } catch (e) {
    console.error(`Error generating questions: ${e}`)
    return { error: String(e) }
  }
}
