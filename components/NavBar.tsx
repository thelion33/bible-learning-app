'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Button } from './ui/button'
import { BookOpen, LogOut, User, Home, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function NavBar() {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Title hidden on mobile */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/revival logo.png" 
              alt="Revival Today" 
              width={36} 
              height={36}
              className="rounded md:w-10 md:h-10"
            />
            <span className="hidden sm:inline font-bold text-base md:text-lg text-[#001f3f]">
              Revival Today Prosperity Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                    <Home className="w-4 h-4 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/lessons" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                    <BookOpen className="w-4 h-4 mr-3" />
                    Lessons
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-[#003366] font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={closeMobileMenu}>
                  <Button className="w-full bg-[#003366] hover:bg-[#004080] text-white font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
