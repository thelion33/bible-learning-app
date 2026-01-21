import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle2, Lock, Calendar, ExternalLink, FileText } from 'lucide-react'
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
  let lessonNotesMap: { [key: string]: boolean } = {}
  
  if (user) {
    const { data: completions } = await supabaseAdmin
      .from('lesson_completions')
      .select('lesson_id, score')
      .eq('user_id', user.id)
    
    completedLessonIds = completions?.map(c => c.lesson_id) || []

    // Get lessons with notes
    const { data: notesData, error: notesError } = await supabaseAdmin
      .from('lesson_notes')
      .select('lesson_id, notes')
      .eq('user_id', user.id)
    
    console.log('Notes data:', notesData)
    console.log('Notes error:', notesError)
    
    // Create a map of lesson IDs that have notes
    notesData?.forEach(note => {
      if (note.notes && note.notes.trim().length > 0) {
        lessonNotesMap[note.lesson_id] = true
        console.log('Lesson has notes:', note.lesson_id)
      }
    })
  }

  console.log('Lesson notes map:', lessonNotesMap)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Your Learning Path
            </h1>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Complete lessons to unlock new content and grow spiritually
            </p>
          </div>

          {lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Lessons Yet</h3>
                <p className="text-gray-600 mb-6">
                  Lessons will appear here once messages are processed.
                </p>
                <Link href="/api/cron/fetch-videos">
                  <Button>Fetch Latest Videos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {lessons.map((lesson, index) => {
                const hasNotes = lessonNotesMap[lesson.id] || false
                console.log(`Lesson ${lesson.id} hasNotes:`, hasNotes)
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isLocked={false}
                    isCompleted={completedLessonIds.includes(lesson.id)}
                    hasNotes={hasNotes}
                  />
                )
              })}
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
  hasNotes,
}: {
  lesson: any
  index: number
  isLocked: boolean
  isCompleted: boolean
  hasNotes: boolean
}) {
  const videoDate = lesson.video?.published_at ? new Date(lesson.video.published_at) : null
  const formattedDate = videoDate ? videoDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null
  const formattedTime = videoDate ? videoDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) : null
  
  return (
    <Card className={`transition-all hover:shadow-lg ${isLocked ? 'opacity-60' : ''} ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2 sm:mb-3">
              <div className={`${isCompleted ? 'bg-green-100' : 'bg-blue-100'} p-1.5 sm:p-2 rounded-lg`}>
                {isLocked ? (
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                ) : (
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#003366]" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Lesson {index + 1}
              </span>
              {isCompleted && (
                <span className="px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Completed
                </span>
              )}
              {hasNotes && (
                <Link 
                  href={`/learn/${lesson.id}?view=notes`}
                  className="group inline-block"
                  title="View your notes"
                >
                  <div className="flex items-center space-x-1 px-2.5 py-1 bg-[#003366] text-white hover:bg-[#004080] text-xs font-semibold rounded-full transition-colors shadow-sm">
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Notes</span>
                  </div>
                </Link>
              )}
            </div>
            <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-3 leading-snug">{lesson.title}</CardTitle>
            
            {/* Video Title & Date/Time */}
            {lesson.video?.title && (
              <div className="mb-3 pb-3 border-b space-y-1.5">
                <p className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-2">
                  {lesson.video.title}
                </p>
                {formattedDate && (
                  <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{formattedDate} at {formattedTime}</span>
                  </div>
                )}
                {/* Watch Video Link */}
                {lesson.video?.youtube_id && (
                  <a 
                    href={`https://www.youtube.com/watch?v=${lesson.video.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs sm:text-sm text-[#003366] hover:text-[#004080] font-medium pt-1"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Watch Full Message</span>
                  </a>
                )}
              </div>
            )}
            
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{lesson.key_themes?.length || 0} themes</span>
            </div>
            {lesson.scripture_references && lesson.scripture_references.length > 0 && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{lesson.scripture_references.length} scriptures</span>
              </div>
            )}
          </div>
          
          {isLocked ? (
            <Button disabled variant="outline" size="sm" className="w-full sm:w-auto">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Locked
            </Button>
          ) : (
            <Link href={`/learn/${lesson.id}`} className="w-full sm:w-auto">
              <Button variant={isCompleted ? 'outline' : 'default'} size="sm" className="w-full sm:w-auto">
                {isCompleted ? 'Review' : 'Start'}
              </Button>
            </Link>
          )}
        </div>

        {lesson.key_themes && lesson.key_themes.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {lesson.key_themes.slice(0, 3).map((theme: string, i: number) => (
                <span
                  key={i}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-[#003366] rounded-full text-xs font-medium"
                >
                  {theme}
                </span>
              ))}
              {lesson.key_themes.length > 3 && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
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
