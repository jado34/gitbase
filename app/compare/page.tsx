import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EssayComparison } from "@/components/essay-comparison"

export default async function ComparePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's essays for comparison
  const { data: essays } = await supabase
    .from("essays")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Essay Comparison</h1>
          <p className="text-slate-600">Compare your essays side by side to track improvement and identify patterns.</p>
        </div>

        <EssayComparison essays={essays || []} userId={data.user.id} />
      </div>
    </div>
  )
}
