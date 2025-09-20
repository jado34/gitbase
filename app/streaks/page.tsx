"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { WritingStreaks } from "@/components/writing-streaks"
import { Navbar } from "@/components/navbar"
import { redirect } from "next/navigation"

export default function StreaksPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        redirect("/auth/login")
        return
      }

      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Writing Streaks & Goals</h1>
            <p className="text-slate-600">Track your writing consistency and set goals to improve your skills.</p>
          </div>
          <WritingStreaks userId={user.id} />
        </div>
      </main>
    </div>
  )
}
