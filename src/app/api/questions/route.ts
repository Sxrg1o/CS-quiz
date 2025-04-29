import { type NextRequest, NextResponse } from "next/server"
import { GeminiQuestionController } from "@/lib/gemini-controller"
import { PromptOptions } from "@/lib/prompt-template"

const controller = new GeminiQuestionController()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const count = Number.parseInt(searchParams.get("count") || "5", 10)

    console.info(`Generating ${count} quiz questions`)

    const promptOptions: PromptOptions = {
      count,
      topic: searchParams.get("topic") || null,
      difficulty: parseInt(searchParams.get("difficulty") || "null"),
    }
    const questions = await controller.generateQuestions(promptOptions)

    if (!questions) {
      console.error("Failed to generate questions")
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
    }

    console.info(`Successfully generated ${questions.length} questions`)
    return NextResponse.json({ questions })
  } catch (e) {
    console.error(`Error in questions API: ${e}`)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
