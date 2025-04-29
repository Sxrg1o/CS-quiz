"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SYLLABUS } from "@/lib/constants"
import { FilterIcon, RefreshCw } from "lucide-react"

export interface FilterOptions {
  topic: string | null
  difficulty: number | null
}

interface FiltersProps {
  onApplyFilters: (filters: FilterOptions) => void
  isLoading: boolean
}

export function Filters({ onApplyFilters, isLoading }: FiltersProps) {
  const [topic, setTopic] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const topics = Object.keys(SYLLABUS.core_topics)

  const handleApplyFilters = () => {
    onApplyFilters({ topic, difficulty })
  }

  const handleResetFilters = () => {
    setTopic(null)
    setDifficulty(null)
    onApplyFilters({ topic: null, difficulty: null })
  }

  return (
    <div className="w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 text-gray-400 border-gray-700 hover:text-gray-300 hover:border-gray-600"
      >
        <FilterIcon className="h-4 w-4 mr-2" />
        Filtros
        {(topic || difficulty) && (
          <span className="ml-2 bg-purple-900 text-purple-100 text-xs px-1.5 py-0.5 rounded-full">
            {(topic ? 1 : 0) + (difficulty ? 1 : 0)}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="p-4 mb-4 bg-gray-800/50 rounded-md border border-gray-700 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Tema</label>
              <Select value={topic || ""} onValueChange={(value) => setTopic(value || null)}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Todos los temas" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todos los temas</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Dificultad</label>
              <Select
                value={difficulty?.toString() || ""}
                onValueChange={(value) => setDifficulty(value ? Number.parseInt(value) : null)}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Cualquier dificultad" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Cualquier dificultad</SelectItem>
                  <SelectItem value="1">Muy fácil (1)</SelectItem>
                  <SelectItem value="2">Fácil (2)</SelectItem>
                  <SelectItem value="3">Media (3)</SelectItem>
                  <SelectItem value="4">Difícil (4)</SelectItem>
                  <SelectItem value="5">Muy difícil (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-gray-400 border-gray-700"
              disabled={!topic && !difficulty}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Reiniciar
            </Button>
            <Button
              onClick={handleApplyFilters}
              size="sm"
              className="bg-purple-700 hover:bg-purple-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Aplicar filtros"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
