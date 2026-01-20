'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from './ui/button'
import { BookOpen, LogOut, User, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

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
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/revival logo.png" 
              alt="Revival Today" 
              width={40} 
              height={40}
              className="rounded"
            />
            <span className="font-bold text-lg text-[#001f3f]">Revival Today Prosperity Academy</span>
          </Link>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/lessons">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lessons
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-[#003366] hover:bg-[#004080] text-white font-semibold">
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
