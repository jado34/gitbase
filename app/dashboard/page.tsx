import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EssayAnalyzer } from "@/components/essay-analyzer"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {profile?.full_name || data.user.email}!
          </h1>
          <p className="text-slate-600">Ready to analyze your next essay? Let's improve your writing together.</p>
        </div>

        <EssayAnalyzer userId={data.user.id} />
      </div>
    </div>
  )
}
