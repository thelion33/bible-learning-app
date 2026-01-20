import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle2, Lock } from 'lucide-react'
import Link from 'next/link'
import { getPublishedLessons } from '@/lib/database'
import { getServerUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LessonsPage() {
  const user = await getServerUser()
  const lessons = await getPublishedLessons()
  
  // Get user's completed lessons
  let completedLessonIds: string[] = []
  if (user) {
    const { data: completions } = await supabaseAdmin
      .from('lesson_completions')
      .select('lesson_id, score')
      .eq('user_id', user.id)
    
    completedLessonIds = completions?.map(c => c.lesson_id) || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Learning Path
            </h1>
            <p className="text-lg text-gray-600">
              Complete lessons to unlock new content and grow spiritually
            </p>
          </div>

          {lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Lessons Yet</h3>
                <p className="text-gray-600 mb-6">
                  Lessons will appear here once sermons are processed.
                </p>
                <Link href="/api/cron/fetch-videos">
                  <Button>Fetch Latest Videos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isLocked={false}
                  isCompleted={completedLessonIds.includes(lesson.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LessonCard({
  lesson,
  index,
  isLocked,
  isCompleted,
}: {
  lesson: any
  index: number
  isLocked: boolean
  isCompleted: boolean
}) {
  return (
    <Card className={`transition-all hover:shadow-lg ${isLocked ? 'opacity-60' : ''} ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`${isCompleted ? 'bg-green-100' : 'bg-blue-100'} p-2 rounded-lg`}>
                {isLocked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-[#003366]" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-500">
                Lesson {index + 1}
              </span>
              {isCompleted && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Completed
                </span>
              )}
            </div>
            <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {lesson.summary}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{lesson.key_themes?.length || 0} themes</span>
            </div>
            {lesson.scripture_references && lesson.scripture_references.length > 0 && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.scripture_references.length} scriptures</span>
              </div>
            )}
          </div>
          
          {isLocked ? (
            <Button disabled variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </Button>
          ) : (
            <Link href={`/learn/${lesson.id}`}>
              <Button variant={isCompleted ? 'outline' : 'default'}>
                {isCompleted ? 'Review Lesson' : 'Start Lesson'}
              </Button>
            </Link>
          )}
        </div>

        {lesson.key_themes && lesson.key_themes.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {lesson.key_themes.slice(0, 3).map((theme: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 text-[#003366] rounded-full text-xs font-medium"
                >
                  {theme}
                </span>
              ))}
              {lesson.key_themes.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  +{lesson.key_themes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
