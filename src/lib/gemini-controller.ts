import { GoogleGenerativeAI } from "@google/generative-ai"
import type { QuizQuestion } from "./types"
import { PromptTemplate, type PromptOptions } from "./prompt-template"

export class GeminiQuestionController {
  private client: GoogleGenerativeAI | null = null
  private logger: Console

  constructor() {
    this.logger = console
  }

  private initClient(): boolean {
    if (this.client) return true

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      this.logger.error("GOOGLE_API_KEY environment variable not set")
      return false
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey)
      this.logger.info("Gemini API client initialized successfully")
      return true
    } catch (e) {
      this.logger.error(`Gemini API client initialization failed: ${e}`)
      return false
    }
  }

  async generateQuestions(options: PromptOptions): Promise<QuizQuestion[] | null> {
    if (!this.initClient()) {
      return null
    }

    const prompt = PromptTemplate.getPromptTemplate(options)
    this.logger.debug(`Prompt for question generation: ${prompt.substring(0, 100)}...`)

    try {
      this.logger.info(`Sending request to Gemini API for ${options.count} questions`)

      const model = this.client!.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()

      this.logger.debug(`Response from Gemini API received`)
      this.logger.debug(`Retrieved text response from Gemini (first 100 chars): ${responseText.substring(0, 100)}...`)

      const questions = this._parseResponse(responseText)
      this.logger.info(`Successfully parsed ${questions.length} questions from the response`)

      return questions
    } catch (e) {
      this.logger.error(`Error generating questions: ${e}`)
      return null
    }
  }

  private _parseResponse(responseText: string): QuizQuestion[] {
    const questions: QuizQuestion[] = []

    try {
      const jsonText = this._extractJsonFromText(responseText)
      this.logger.debug(`Extracted JSON from response (first 100 chars): ${jsonText.substring(0, 100)}...`)

      const data = JSON.parse(jsonText)
      this.logger.debug(`JSON parsed successfully, data type: ${typeof data}`)

      if (Array.isArray(data)) {
        this.logger.debug(`Response contains a list with ${data.length} items`)
        for (const item of data) {
          questions.push(item)
        }
      } else if (typeof data === "object" && data !== null) {
        if ("questions" in data) {
          this.logger.debug(
            `Response contains a dictionary with 'questions' key (${data.questions?.length || 0} items)`,
          )
          for (const item of data.questions || []) {
            questions.push(item)
          }
        } else {
          this.logger.debug("Response contains a single question dictionary")
          questions.push(data)
        }
      }

      this.logger.info(`Successfully parsed ${questions.length} questions`)
      return questions
    } catch (e) {
      if (e instanceof SyntaxError) {
        this.logger.error(`Error parsing JSON response: ${e}`)
        this.logger.debug(`Raw response (first 500 chars): ${responseText.substring(0, 500)}...`)
      } else {
        this.logger.error(`Unexpected error while parsing response: ${e}`)
        this.logger.debug(`Raw response causing error (first 500 chars): ${responseText.substring(0, 500)}...`)
      }
      return []
    }
  }

  private _extractJsonFromText(text: string): string {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      this.logger.debug("Found JSON content in markdown code block")
      return jsonMatch[1].trim()
    }

    this.logger.debug("No markdown code blocks found, using original text")
    return text
  }
}
