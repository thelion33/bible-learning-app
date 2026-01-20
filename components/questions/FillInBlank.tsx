'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle } from 'lucide-react'

interface FillInBlankProps {
  question: string
  correctAnswer: string
  explanation?: string
  onAnswer: (isCorrect: boolean) => void
  onContinue: () => void
}

export function FillInBlank({
  question,
  correctAnswer,
  explanation,
  onAnswer,
  onContinue,
}: FillInBlankProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    // Flexible matching: case-insensitive, trim whitespace
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)
    onAnswer(correct)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{question}</h2>

      <div className="space-y-4">
        <Input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={showResult}
          placeholder="Type your answer..."
          className="text-lg p-6"
          autoFocus
        />

        {showResult && (
          <div
            className={`flex items-center space-x-3 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-green-900 font-medium">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <span className="text-red-900 font-medium">Not quite.</span>
                  <p className="text-sm text-red-700 mt-1">
                    The correct answer is: <strong>{correctAnswer}</strong>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {showResult && explanation && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">{explanation}</p>
          </div>
        )}
      </div>

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
          disabled={!userAnswer.trim()}
          className="w-full"
          size="lg"
        >
          Check Answer
        </Button>
      )}
    </div>
  )
}
