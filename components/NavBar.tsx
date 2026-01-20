'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from './ui/button'
import { BookOpen, LogOut, User, Home } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NavBar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-[#001f3f] shadow-lg sticky top-0 z-50 border-b-2 border-red-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="bg-red-600 p-2 rounded">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl text-white uppercase tracking-wider">Revival Today Learning</span>
          </Link>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-[#003366] hover:text-red-500 font-bold uppercase text-xs">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/lessons">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-[#003366] hover:text-red-500 font-bold uppercase text-xs">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lessons
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-[#003366] hover:text-red-500 font-bold uppercase text-xs">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-[#003366] hover:text-red-500 font-bold uppercase text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
