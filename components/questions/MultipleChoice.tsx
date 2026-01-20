'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'

interface MultipleChoiceProps {
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
  onAnswer: (isCorrect: boolean) => void
  onContinue: () => void
}

export function MultipleChoice({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer,
  onContinue,
}: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (option: string) => {
    if (showResult) return
    setSelectedOption(option)
  }

  const handleSubmit = () => {
    if (!selectedOption) return
    
    const isCorrect = selectedOption === correctAnswer
    setShowResult(true)
    onAnswer(isCorrect)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{question}</h2>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === option
          const isCorrect = option === correctAnswer
          const showCorrect = showResult && isCorrect
          const showIncorrect = showResult && isSelected && !isCorrect

          return (
            <Card
              key={index}
              onClick={() => handleSelect(option)}
              className={`p-4 cursor-pointer transition-all ${
                isSelected && !showResult
                  ? 'border-purple-500 bg-purple-50 border-2'
                  : 'hover:border-gray-400'
              } ${
                showCorrect
                  ? 'border-green-500 bg-green-50 border-2'
                  : ''
              } ${
                showIncorrect
                  ? 'border-red-500 bg-red-50 border-2'
                  : ''
              } ${showResult ? 'cursor-default' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
                {showIncorrect && (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {showResult && explanation && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">{explanation}</p>
        </div>
      )}

      {showResult ? (
        <Button
          onClick={onContinue}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full"
          size="lg"
        >
          Check Answer
        </Button>
      )}
    </div>
  )
}
