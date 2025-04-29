import { type QuestionParameters, QuestionType, AnswerType } from "./types"
import { SYLLABUS, FULL_EXAMPLE } from "./constants"

export interface PromptOptions {
  count: number
  topic?: string | null
  difficulty?: number | null
}

export class PromptTemplate {
  static getPromptTemplate(options: PromptOptions): string {
    const { count, topic, difficulty } = options

    const questionParams = PromptTemplate._generateQuestionParams(count, topic, difficulty)

    let prompt = `Genera ${count} preguntas de admisión para un posgrado de computer science con las siguientes características:\n\n`

    questionParams.forEach((params, i) => {
      prompt += `Pregunta ${i + 1}:\n`
      prompt += `- Tema: ${params.topic}\n`
      prompt += `- Subtema: ${params.subtopic}\n`
      prompt += `- Dificultad: ${params.difficulty} (escala 1-5)\n`
      prompt += `- Tipo de pregunta: ${params.question_type}\n`
      prompt += `- Tipo de respuesta: ${params.response_type}\n`
      prompt += `- Número de opciones: ${params.options_count}\n`
      prompt += `- Número de pistas: ${params.clues_count}\n`
    })

    prompt += "\nCada pregunta debe seguir el siguiente formato JSON:\n"
    prompt += `${FULL_EXAMPLE}\n\n`

    prompt +=
      "Requisitos adicionales:\n" +
      "- Las preguntas deben ser claras, concisas y relevantes para el nivel de posgrado\n" +
      "- Las opciones incorrectas deben ser plausibles y del mismo nivel de complejidad\n" +
      '- Asegúrate de que cada pregunta tenga una explicación detallada en la sección "summary"\n' +
      "- Incluye al menos 2 referencias relevantes para cada pregunta\n" +
      "- El formato JSON debe cumplir estrictamente con el esquema proporcionado\n\n" +
      "Responde solamente con el JSON de las preguntas generadas.\n"

    return prompt
  }

  private static _generateQuestionParams(
    count: number,
    topic?: string | null,
    difficulty?: number | null,
  ): QuestionParameters[] {
    const paramsList: QuestionParameters[] = []

    const coreTopics = SYLLABUS.core_topics
    const topicNames = Object.keys(coreTopics)

    for (let i = 0; i < count; i++) {
      const selectedTopic = topic || topicNames[Math.floor(Math.random() * topicNames.length)]

      const subtopics = coreTopics[selectedTopic as keyof typeof coreTopics]
      const subtopic = subtopics.length > 0 ? subtopics[Math.floor(Math.random() * subtopics.length)] : "General"

      const selectedDifficulty = difficulty || Math.floor(Math.random() * 5) + 1

      const params: QuestionParameters = {
        topic: selectedTopic,
        subtopic,
        difficulty: selectedDifficulty,
        question_type: Object.values(QuestionType)[Math.floor(Math.random() * Object.values(QuestionType).length)],
        response_type: Object.values(AnswerType)[Math.floor(Math.random() * Object.values(AnswerType).length)],
        options_count: 5, 
        clues_count: 3, 
      }

      paramsList.push(params)
    }

    return paramsList
  }
}
