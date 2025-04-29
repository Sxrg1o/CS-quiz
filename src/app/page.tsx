"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CheckCircle, XCircle, ChevronRight, BookOpen, Loader2, KeyRound } from "lucide-react"
import { generateQuestions } from "./actions"
import type { QuizQuestion } from "@/lib/types"
import { Filters, type FilterOptions } from "@/components/filters"

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    <p className="text-gray-400">Generando preguntas...</p>
  </div>
)

const ApiKeyPrompt = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
    <KeyRound className="h-12 w-12 text-purple-500" />
    <h2 className="text-xl font-medium text-gray-200">Se requiere API Key de Google</h2>
    <p className="text-gray-400 max-w-md">
      Para generar preguntas, necesitas configurar tu API Key de Google Gemini. Puedes obtener una en{" "}
      <a
        href="https://ai.google.dev/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:underline"
      >
        Google AI Studio
      </a>
      .
    </p>
    <div className="bg-gray-800 p-4 rounded-md w-full max-w-md">
      <p className="text-sm text-gray-300 mb-2">Añade la siguiente variable de entorno a tu proyecto:</p>
      <div className="bg-gray-900 p-2 rounded font-mono text-sm text-gray-300">GOOGLE_API_KEY=tu-api-key</div>
    </div>
    <p className="text-sm text-gray-500">
      Una vez configurada, reinicia la aplicación para comenzar a generar preguntas.
    </p>
  </div>
)

const sampleQuestion: QuizQuestion = {
  question: "¿Cuál es la complejidad temporal del algoritmo Quicksort en el peor caso?",
  clues: [
    "Es un algoritmo de ordenamiento basado en la estrategia divide y vencerás",
    "Su eficiencia depende de la elección del pivote",
    "En el peor caso, el pivote siempre es el elemento más pequeño o más grande",
    "Su complejidad promedio es O(n log n)",
    "Puede ser mejorado con técnicas como la selección de pivote aleatorio",
  ],
  questionType: "teorica" as any,
  answerType: "respuesta_unica" as any,
  options: [
    { label: "O(1)", answer: false },
    { label: "O(log n)", answer: false },
    { label: "O(n)", answer: false },
    { label: "O(n log n)", answer: false },
    { label: "O(n²)", answer: true },
  ],
  metadata: {
    topic: "Algoritmos y Estructuras de Datos",
    subtopic: "Algoritmos de ordenamiento",
    difficulty: 3,
    tags: ["algoritmos", "ordenamiento", "complejidad", "quicksort"],
  },
  summary:
    "El algoritmo Quicksort tiene una complejidad temporal de O(n²) en el peor caso, que ocurre cuando el pivote elegido siempre es el elemento más pequeño o más grande, resultando en particiones muy desbalanceadas. En este escenario, el algoritmo se comporta similar a un algoritmo de ordenamiento por inserción. Sin embargo, su complejidad promedio es O(n log n), lo que lo hace eficiente en la práctica, especialmente cuando se implementan técnicas como la selección aleatoria del pivote.",
  references: [
    {
      type: "book",
      citation:
        "Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). Introduction to Algorithms (3rd ed.). MIT Press.",
      pages: "170-190",
    },
    {
      type: "article",
      citation: "Hoare, C. A. R. (1962). Quicksort. The Computer Journal, 5(1), 10-16.",
      url: "https://doi.org/10.1093/comjnl/5.1.10",
    },
  ],
}

export default function PoscompQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({ topic: null, difficulty: null })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async (newFilters?: FilterOptions) => {
    setLoading(true)
    setError(null)
    setApiKeyMissing(false)

    if (newFilters) {
      setFilters(newFilters)
    }

    const currentFilters = newFilters || filters

    try {
      const result = await generateQuestions({
        count: 5,
        topic: currentFilters.topic,
        difficulty: currentFilters.difficulty,
      })

      if (result.error) {
        if (result.error.includes("GOOGLE_API_KEY") || result.error.includes("API key")) {
          setApiKeyMissing(true)
          setQuestions([sampleQuestion])
        } else {
          setError(result.error)
        }
      } else if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions)
        setCurrentQuestionIndex(0)
        setSelectedOptions([])
        setShowResult(false)
      } else {
        setError("No se pudieron generar preguntas")
      }
    } catch (e) {
      setError(`Error al cargar preguntas: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (totalAnswered > 0) {
      setAccuracy(Math.round((score / totalAnswered) * 100))
    }
  }, [score, totalAnswered])

  useEffect(() => {
    const interval = setInterval(() => {
      if(loading) return
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    setTimerInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (index: number) => {
    if (currentQuestion.answerType === "respuesta_multiple") {
      setSelectedOptions((prev) => {
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index)
        } else {
          return [...prev, index]
        }
      })
    } else {
      setSelectedOptions([index])
    }
  }

  const handleConfirm = () => {
    setShowResult(true)
    setTotalAnswered((prev) => prev + 1)

    if (currentQuestion && selectedOptions.length > 0) {
      if (currentQuestion.answerType === "respuesta_multiple") {
        const correctOptions = currentQuestion.options
          .map((opt, idx) => (opt.answer ? idx : -1))
          .filter((idx) => idx !== -1)

        const isCorrect =
          correctOptions.length === selectedOptions.length &&
          correctOptions.every((opt) => selectedOptions.includes(opt))

        if (isCorrect) {
          setScore((prev) => prev + 1)
        }
      } else {
        const selectedIndex = selectedOptions[0]
        const isCorrect = currentQuestion.options[selectedIndex].answer
        if (isCorrect) {
          setScore((prev) => prev + 1)
        }
      }
    }
  }

  const handleNextQuestion = () => {
    setSelectedOptions([])
    setElapsedTime(0)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setShowResult(false)
    } else if (!apiKeyMissing) {
      setLoading(true)
      generateQuestions({
        count: 5,
        topic: filters.topic,
        difficulty: filters.difficulty,
      }).then((result) => {
        if (result.questions) {
          const newQuestions = result.questions || [];
          setQuestions((prev) => [...prev, ...newQuestions])
        }
        setLoading(false)
        setCurrentQuestionIndex((prev) => prev + 1)
        setShowResult(false)
      })
    } else {
      setCurrentQuestionIndex(0)
      setShowResult(false)
    }
  }

  const handleApplyFilters = (newFilters: FilterOptions) => {
    loadQuestions(newFilters)
  }

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-gray-900 border-gray-800">
          <CardContent>
            <LoadingState />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (apiKeyMissing && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-gray-900 border-gray-800">
          <CardContent>
            <ApiKeyPrompt />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !apiKeyMissing) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="text-red-400 flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12" />
              <h2 className="text-xl font-medium">Error</h2>
              <p className="text-center">{error}</p>
              <Button className="mt-4 bg-purple-700 hover:bg-purple-600" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="text-yellow-400 flex flex-col items-center space-y-4">
              <h2 className="text-xl font-medium">No hay preguntas disponibles</h2>
              <Button className="mt-4 bg-purple-700 hover:bg-purple-600" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCorrect =
    currentQuestion.answerType === "respuesta_multiple"
      ? (() => {
          const correctOptions = currentQuestion.options
            .map((opt, idx) => (opt.answer ? idx : -1))
            .filter((idx) => idx !== -1)
          return (
            correctOptions.length === selectedOptions.length &&
            correctOptions.every((opt) => selectedOptions.includes(opt))
          )
        })()
      : selectedOptions.length > 0 && currentQuestion.options[selectedOptions[0]].answer

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-gray-900 border-gray-800">
        {apiKeyMissing && (
          <div className="bg-yellow-900/30 border-b border-yellow-800 p-3 text-sm text-yellow-300 flex items-center">
            <KeyRound className="h-4 w-4 mr-2" />
            <span>
              Modo demostración: Configura tu{" "}
              <span className="font-mono bg-yellow-950/50 px-1 rounded">GOOGLE_API_KEY</span> para generar preguntas
              reales.
            </span>
          </div>
        )}

        <CardHeader className="space-y-2 pb-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-400">{currentQuestion.metadata.topic}</h1>
            <div className="text-sm text-gray-400">
              Puntaje: {score}/{totalAnswered} | Accuracy: {accuracy}%
            </div>
          </div>
          <h2 className="text-lg font-medium text-gray-300">{currentQuestion.metadata.subtopic}</h2>

          <Filters onApplyFilters={handleApplyFilters} isLoading={loading} />
          <div className="flex justify-between">
            <Badge
              variant="outline"
              className={`
                ${currentQuestion.metadata.difficulty <= 2 ? "border-green-600 text-green-400" : ""}
                ${currentQuestion.metadata.difficulty === 3 ? "border-yellow-600 text-yellow-400" : ""}
                ${currentQuestion.metadata.difficulty >= 4 ? "border-red-600 text-red-400" : ""}
              `}
            >
              Dificultad: {currentQuestion.metadata.difficulty}/5
            </Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-400">
              Tiempo: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
            </Badge>
          </div>
          
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-xl font-medium py-2">{currentQuestion.question}</div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full justify-start text-left h-auto py-3 px-4 transition-all flex items-start ${ 
                  selectedOptions.includes(index)
                    ? "border-purple-500 bg-purple-950/30"
                    : "border-gray-700 hover:border-gray-500"
                } ${showResult && option.answer ? "border-green-500 bg-green-950/30" : ""} ${
                  showResult && selectedOptions.includes(index) && !option.answer ? "border-red-500 bg-red-950/30" : ""
                }`}
                onClick={() => !showResult && handleOptionSelect(index)}
                disabled={showResult}
              >
                {currentQuestion.answerType === "respuesta_multiple" ? (
                  <div
                    className={`w-5 h-5 border rounded mr-2 flex items-center justify-center flex-shrink-0 ${ 
                      selectedOptions.includes(index) ? "bg-purple-500 border-purple-500" : "border-gray-500"
                    }`}
                  >
                    {selectedOptions.includes(index) && <span className="text-white text-xs">✓</span>} 
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 border rounded-full mr-2 flex items-center justify-center flex-shrink-0 ${
                      selectedOptions.includes(index) ? "bg-purple-500 border-purple-500" : "border-gray-500"
                    }`}
                  >
                    {selectedOptions.includes(index) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                )}

                <span className="mr-2 flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1 break-words whitespace-normal">{option.label}</span>

              </Button>
            ))}
          </div>
          {!showResult ? (
            <Button
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
              disabled={selectedOptions.length === 0}
              onClick={handleConfirm}
            >
              Confirmar respuesta
            </Button>
          ) :(
            <div className="space-y-4 animate-fadeIn">
              <div
                className={`flex items-center p-4 rounded-md ${
                  isCorrect ? "bg-green-950/30 text-green-400" : "bg-red-950/30 text-red-400"
                }`}
              >
                {isCorrect ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                <span className="font-medium">{isCorrect ? "¡Correcto!" : "Incorrecto"}</span>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-md">
                <div className="flex items-center mb-2 text-purple-400">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <h3 className="font-medium">Explicación</h3>
                </div>
                <p className="text-gray-300">{currentQuestion.summary}</p>

                {currentQuestion.references && currentQuestion.references.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Referencias:</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {currentQuestion.references.map((ref, index) => (
                        <li key={index}>
                          {ref.citation}
                          {ref.pages && <span> (pp. {ref.pages})</span>}
                          {ref.url && (
                            <span>
                              {" "}
                              -{" "}
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:underline"
                              >
                                Enlace
                              </a>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white" onClick={handleNextQuestion}>
                <span>Siguiente pregunta</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-xs text-gray-500 pt-2 flex justify-between">
          <span>
            POSCOMP Quiz - Pregunta #{currentQuestionIndex + 1} de {questions.length}
          </span>
          <span>
            Tipo: {currentQuestion.questionType.replace(/_/g, " ")} |
            {currentQuestion.answerType === "respuesta_unica" ? " Respuesta única" : " Respuesta múltiple"}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
