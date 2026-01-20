'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { MultipleChoice } from '@/components/questions/MultipleChoice'
import { FillInBlank } from '@/components/questions/FillInBlank'
import { ScriptureMatch } from '@/components/questions/ScriptureMatch'
import { TrueFalse } from '@/components/questions/TrueFalse'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trophy, Star, BookOpen, ArrowRight } from 'lucide-react'
import type { Question, Lesson } from '@/types'

export default function LearnPage({ params }: { params: { lessonId: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Get lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', params.lessonId)
        .single()

      if (lessonData) {
        setLesson(lessonData)
      }

      // Get questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', params.lessonId)
        .order('order_index', { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)
      }

      setLoading(false)
    }

    loadData()
  }, [params.lessonId, router, supabase])

  const handleAnswer = async (isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex]

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
      setTotalXP((prev) => prev + currentQuestion.xp_value)

      // Record progress in database
      if (user) {
        await fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: params.lessonId,
            questionId: currentQuestion.id,
            isCorrect: true,
            xpEarned: currentQuestion.xp_value,
          }),
        })
      }
    } else {
      // Record incorrect attempt
      if (user) {
        await fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: params.lessonId,
            questionId: currentQuestion.id,
            isCorrect: false,
            xpEarned: 0,
          }),
        })
      }
    }
  }

  const handleContinue = async () => {
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Mark lesson as complete
      if (user) {
        const percentage = Math.round((correctAnswers / questions.length) * 100)
        await fetch('/api/user/complete-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: params.lessonId,
            score: percentage,
            totalXpEarned: totalXP,
          }),
        })
      }
      setIsComplete(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lesson Not Found</h3>
            <p className="text-gray-600 mb-6">
              This lesson doesn't have any questions yet.
            </p>
            <Button onClick={() => router.push('/lessons')}>
              Back to Lessons
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    const percentage = Math.round((correctAnswers / questions.length) * 100)
    const isPerfect = correctAnswers === questions.length

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mb-6">
              {isPerfect ? (
                <div className="bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-12 h-12 text-yellow-600" />
                </div>
              ) : (
                <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-12 h-12 text-purple-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {isPerfect ? 'Perfect Score!' : 'Lesson Complete!'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isPerfect
                ? 'Amazing work! You got every question right!'
                : `You got ${correctAnswers} out of ${questions.length} questions correct`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{totalXP}</p>
                <p className="text-sm text-gray-600">XP Earned</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{percentage}%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{correctAnswers}/{questions.length}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
            </div>

            {lesson.key_themes && lesson.key_themes.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3 text-gray-900">Key Themes Covered:</h4>
                <div className="flex flex-wrap gap-2">
                  {lesson.key_themes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  router.push('/lessons')
                  router.refresh()
                }}
              >
                Back to Lessons
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  router.push('/dashboard')
                  router.refresh()
                }}
              >
                View Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
        xp={totalXP}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              {lesson.title}
            </h1>
          </div>

          <Card className="p-8">
            {currentQuestion.type === 'multiple_choice' && (
              <MultipleChoice
                question={currentQuestion.question_text}
                options={currentQuestion.options as string[]}
                correctAnswer={currentQuestion.correct_answer}
                explanation={currentQuestion.explanation}
                onAnswer={handleAnswer}
                onContinue={handleContinue}
              />
            )}

            {currentQuestion.type === 'fill_in_blank' && (
              <FillInBlank
                question={currentQuestion.question_text}
                correctAnswer={currentQuestion.correct_answer}
                explanation={currentQuestion.explanation}
                onAnswer={handleAnswer}
                onContinue={handleContinue}
              />
            )}

            {currentQuestion.type === 'scripture_match' && (
              <ScriptureMatch
                question={currentQuestion.question_text}
                options={currentQuestion.options as string[]}
                correctAnswer={currentQuestion.correct_answer}
                explanation={currentQuestion.explanation}
                onAnswer={handleAnswer}
                onContinue={handleContinue}
              />
            )}

            {currentQuestion.type === 'true_false' && (
              <TrueFalse
                question={currentQuestion.question_text}
                correctAnswer={currentQuestion.correct_answer}
                explanation={currentQuestion.explanation}
                onAnswer={handleAnswer}
                onContinue={handleContinue}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
