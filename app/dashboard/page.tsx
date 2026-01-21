import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trophy, Flame, BookOpen, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user stats using admin client to bypass RLS
  let { data: stats, error: statsError } = await supabaseAdmin
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If no stats exist, create them
  if (!stats) {
    const { data: newStats } = await supabaseAdmin
      .from('user_stats')
      .insert({
        user_id: user.id,
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        lessons_completed: 0,
        questions_answered: 0,
      })
      .select()
      .single()
    
    stats = newStats
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Continue your spiritual growth journey
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <StatCard
              icon={<Trophy className="w-6 h-6 text-yellow-600" />}
              label="Total XP"
              value={stats?.total_xp || 0}
              bgColor="bg-yellow-50"
            />
            <StatCard
              icon={<Flame className="w-6 h-6 text-orange-600" />}
              label="Current Streak"
              value={`${stats?.current_streak || 0} days`}
              bgColor="bg-orange-50"
            />
            <StatCard
              icon={<BookOpen className="w-6 h-6 text-[#003366]" />}
              label="Lessons Completed"
              value={stats?.lessons_completed || 0}
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<Star className="w-6 h-6 text-blue-600" />}
              label="Questions Answered"
              value={stats?.questions_answered || 0}
              bgColor="bg-blue-50"
            />
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Continue Learning */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link href="/lessons">
                    <Button size="lg" className="w-full">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Browse All Lessons
                    </Button>
                  </Link>
                  <div className="text-center text-sm text-gray-500">
                    Start a lesson to see your progress here
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Daily Goal</span>
                </CardTitle>
                <CardDescription>
                  {stats?.questions_answered || 0} / 10 questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={(stats?.questions_answered || 0) * 10} max={100} />
                <p className="text-sm text-gray-600 mt-4">
                  Complete 10 questions today to maintain your streak!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                Keep learning to unlock more achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AchievementBadge
                  icon="🎯"
                  name="First Steps"
                  description="Complete your first lesson"
                  unlocked={stats?.lessons_completed ? stats.lessons_completed > 0 : false}
                />
                <AchievementBadge
                  icon="🔥"
                  name="On Fire"
                  description="Maintain a 7-day streak"
                  unlocked={stats?.current_streak ? stats.current_streak >= 7 : false}
                />
                <AchievementBadge
                  icon="📚"
                  name="Scholar"
                  description="Complete 5 lessons"
                  unlocked={stats?.lessons_completed ? stats.lessons_completed >= 5 : false}
                />
                <AchievementBadge
                  icon="⭐"
                  name="Century"
                  description="Answer 100 questions"
                  unlocked={stats?.questions_answered ? stats.questions_answered >= 100 : false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: string
}) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left">
          <div className={`${bgColor} p-2 sm:p-3 rounded-lg`}>{icon}</div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AchievementBadge({
  icon,
  name,
  description,
  unlocked,
}: {
  icon: string
  name: string
  description: string
  unlocked: boolean
}) {
  return (
    <div
      className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
        unlocked
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-gray-50 opacity-50'
      }`}
    >
      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>
      <h4 className="font-semibold text-xs sm:text-sm mb-1">{name}</h4>
      <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
    </div>
  )
}
