"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { User, LogOut, BarChart3, Menu, ArrowUpDown, Flame } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"

interface NavbarProps {
  user?: any
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    setIsLoading(false)
    setIsOpen(false)
  }

  const NavLinks = () => (
    <>
      {user ? (
        <>
          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/compare" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Compare Essays
            </Button>
          </Link>
          <Link href="/streaks" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Flame className="w-4 h-4" />
              Streaks & Goals
            </Button>
          </Link>
          <Link href="/progress" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2">
            <User className="w-4 h-4" />
            <span className="truncate">{user.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full justify-start gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
            <Button size="sm" className="w-full">
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            <span className="font-semibold text-slate-900">Essay Scorer</span>
          </Link>

          {isMobile ? (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/compare">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ArrowUpDown className="w-4 h-4" />
                      Compare
                    </Button>
                  </Link>
                  <Link href="/streaks">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Flame className="w-4 h-4" />
                      Streaks
                    </Button>
                  </Link>
                  <Link href="/progress">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Progress
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="max-w-32 truncate">{user.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="gap-2 bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoading ? "Signing out..." : "Sign Out"}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
