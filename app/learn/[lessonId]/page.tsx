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
  const [showIntro, setShowIntro] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
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

      // Fetch existing notes if any
      if (user) {
        const notesResponse = await fetch(
          `/api/user/lesson-notes?userId=${user.id}&lessonId=${params.lessonId}`
        )
        if (notesResponse.ok) {
          const notesData = await notesResponse.json()
          if (notesData.data?.notes) {
            setNotes(notesData.data.notes)
          }
        }
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

  const handleSaveNotes = async () => {
    if (!user) return

    setIsSavingNotes(true)
    setNotesSaved(false)

    try {
      const response = await fetch('/api/user/lesson-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId: params.lessonId,
          notes,
        }),
      })

      if (response.ok) {
        setNotesSaved(true)
        setTimeout(() => setNotesSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setIsSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-[#003366] mx-auto mb-4 animate-pulse" />
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
              This lesson doesn&apos;t have any questions yet.
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              {isPerfect ? (
                <div className="bg-yellow-100 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-600" />
                </div>
              ) : (
                <div className="bg-blue-100 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 sm:w-12 sm:h-12 text-[#003366]" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl sm:text-3xl mb-2">
              {isPerfect ? 'Perfect Score!' : 'Lesson Complete!'}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg px-2">
              {isPerfect
                ? 'Amazing work! You got every question right!'
                : `You got ${correctAnswers} out of ${questions.length} questions correct`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-[#003366]">{totalXP}</p>
                <p className="text-xs sm:text-sm text-gray-600">XP Earned</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-4 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{percentage}%</p>
                <p className="text-xs sm:text-sm text-gray-600">Accuracy</p>
              </div>
              <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{correctAnswers}/{questions.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Correct</p>
              </div>
            </div>

            {lesson.key_themes && lesson.key_themes.length > 0 && (
              <div className="border-t pt-4 sm:pt-6">
                <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-gray-900">Key Themes Covered:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {lesson.key_themes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2 sm:px-3 py-1 bg-blue-50 text-[#003366] rounded-full text-xs sm:text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Reflections */}
            <div className="border-t pt-4 sm:pt-6">
              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-gray-900">Notes & Reflections</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                Capture your thoughts, insights, or key takeaways from this lesson.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you learn? How will you apply this teaching? Write your reflections here..."
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-y"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {notes.length} characters
                </span>
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || !notes.trim()}
                  size="sm"
                  className="bg-[#003366] hover:bg-[#004080]"
                >
                  {isSavingNotes ? 'Saving...' : notesSaved ? '✓ Saved' : 'Save Notes'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1 w-full"
                size="sm"
                onClick={() => {
                  router.push('/lessons')
                  router.refresh()
                }}
              >
                Back to Lessons
              </Button>
              <Button
                className="flex-1 w-full"
                size="sm"
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

  // Show intro screen before questions
  if (showIntro) {
    const estimatedTime = Math.ceil(questions.length * 1.5) // ~1.5 min per question
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#003366]" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl mb-2">{lesson.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Lesson Overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Summary */}
                {lesson.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Message Summary</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{lesson.summary}</p>
                  </div>
                )}

                {/* Key Themes */}
                {lesson.key_themes && lesson.key_themes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Key Topics You&apos;ll Learn</h3>
                    <div className="space-y-2">
                      {lesson.key_themes.map((theme, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#003366] mt-2 flex-shrink-0" />
                          <p className="text-sm sm:text-base text-gray-700">{theme}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scripture References */}
                {lesson.scripture_references && lesson.scripture_references.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Scripture References</h3>
                    <div className="flex flex-wrap gap-2">
                      {lesson.scripture_references.map((ref, i) => (
                        <span
                          key={i}
                          className="px-2 sm:px-3 py-1 bg-blue-50 text-[#003366] rounded-full text-xs sm:text-sm font-medium"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lesson Stats */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-[#003366]">{questions.length}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Questions</p>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xl sm:text-2xl font-bold text-green-600">~{estimatedTime} min</p>
                      <p className="text-xs sm:text-sm text-gray-600">Est. Time</p>
                    </div>
                  </div>
                </div>

                {/* Begin Button */}
                <Button
                  onClick={() => setShowIntro(false)}
                  className="w-full bg-[#003366] hover:bg-[#004080] text-white py-6 text-base font-semibold"
                  size="lg"
                >
                  Begin Lesson
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
        xp={totalXP}
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 px-1">
              {lesson.title}
            </h1>
          </div>

          <Card className="p-4 sm:p-6 md:p-8">
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
