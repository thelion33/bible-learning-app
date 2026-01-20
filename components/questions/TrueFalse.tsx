'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

interface TrueFalseProps {
  question: string
  correctAnswer: string
  explanation?: string
  onAnswer: (isCorrect: boolean) => void
  onContinue: () => void
}

export function TrueFalse({
  question,
  correctAnswer,
  explanation,
  onAnswer,
  onContinue,
}: TrueFalseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (answer: string) => {
    if (showResult) return
    
    setSelectedAnswer(answer)
    const isCorrect = answer.toLowerCase() === correctAnswer.toLowerCase()
    setShowResult(true)
    onAnswer(isCorrect)
  }

  const isCorrect = selectedAnswer?.toLowerCase() === correctAnswer.toLowerCase()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{question}</h2>

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handleSelect('true')}
          disabled={showResult}
          size="lg"
          variant={
            showResult && selectedAnswer === 'true'
              ? isCorrect
                ? 'default'
                : 'destructive'
              : 'outline'
          }
          className={`h-24 text-xl font-bold ${
            !showResult && selectedAnswer === 'true' ? 'border-purple-500 bg-purple-50 border-2' : ''
          } ${
            showResult && correctAnswer.toLowerCase() === 'true'
              ? 'border-green-500 bg-green-50 border-2 text-green-700'
              : ''
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <span>TRUE</span>
            {showResult && correctAnswer.toLowerCase() === 'true' && (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            )}
            {showResult &&
              selectedAnswer === 'true' &&
              correctAnswer.toLowerCase() !== 'true' && (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
          </div>
        </Button>

        <Button
          onClick={() => handleSelect('false')}
          disabled={showResult}
          size="lg"
          variant={
            showResult && selectedAnswer === 'false'
              ? isCorrect
                ? 'default'
                : 'destructive'
              : 'outline'
          }
          className={`h-24 text-xl font-bold ${
            !showResult && selectedAnswer === 'false' ? 'border-purple-500 bg-purple-50 border-2' : ''
          } ${
            showResult && correctAnswer.toLowerCase() === 'false'
              ? 'border-green-500 bg-green-50 border-2 text-green-700'
              : ''
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <span>FALSE</span>
            {showResult && correctAnswer.toLowerCase() === 'false' && (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            )}
            {showResult &&
              selectedAnswer === 'false' &&
              correctAnswer.toLowerCase() !== 'false' && (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
          </div>
        </Button>
      </div>

      {showResult && explanation && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">{explanation}</p>
        </div>
      )}

      {showResult && (
        <Button
          onClick={onContinue}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      )}
    </div>
  )
}
