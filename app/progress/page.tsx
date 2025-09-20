import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, TrendingUp, FileText, Award } from "lucide-react"

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user's essays with pagination
  const { data: essays } = await supabase
    .from("essays")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const totalEssays = essays?.length || 0
  const averageScore = essays?.length ? essays.reduce((sum, essay) => sum + essay.score, 0) / essays.length : 0

  const averageGrammar = essays?.length
    ? essays.reduce((sum, essay) => sum + (essay.criteria_scores?.grammar || 0), 0) / essays.length
    : 0

  const averageContent = essays?.length
    ? essays.reduce((sum, essay) => sum + (essay.criteria_scores?.content || 0), 0) / essays.length
    : 0

  const averageStructure = essays?.length
    ? essays.reduce((sum, essay) => sum + (essay.criteria_scores?.structure || 0), 0) / essays.length
    : 0

  const averageVocabulary = essays?.length
    ? essays.reduce((sum, essay) => sum + (essay.criteria_scores?.vocabulary || 0), 0) / essays.length
    : 0

  const averageCoherence = essays?.length
    ? essays.reduce((sum, essay) => sum + (essay.criteria_scores?.coherence || 0), 0) / essays.length
    : 0

  const recentImprovement = essays && essays.length >= 2 ? essays[0].score - essays[essays.length - 1].score : 0

  const getPlagiarismRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar user={data.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Writing Progress</h1>
          <p className="text-slate-600">Track your improvement and see detailed analytics of your essays.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEssays}</div>
              <p className="text-xs text-muted-foreground">Essays analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}/100</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentImprovement > 0 ? "+" : ""}
                {recentImprovement.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Since first essay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {essays?.filter((essay) => {
                  const essayDate = new Date(essay.created_at)
                  const now = new Date()
                  return essayDate.getMonth() === now.getMonth() && essayDate.getFullYear() === now.getFullYear()
                }).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Essays this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Grammar & Mechanics</span>
                <span>{averageGrammar.toFixed(1)}/100</span>
              </div>
              <Progress value={averageGrammar} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Content Quality</span>
                <span>{averageContent.toFixed(1)}/100</span>
              </div>
              <Progress value={averageContent} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Structure & Organization</span>
                <span>{averageStructure.toFixed(1)}/100</span>
              </div>
              <Progress value={averageStructure} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Vocabulary Usage</span>
                <span>{averageVocabulary.toFixed(1)}/100</span>
              </div>
              <Progress value={averageVocabulary} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Coherence & Flow</span>
                <span>{averageCoherence.toFixed(1)}/100</span>
              </div>
              <Progress value={averageCoherence} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Essays */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Essays</CardTitle>
          </CardHeader>
          <CardContent>
            {essays && essays.length > 0 ? (
              <div className="space-y-4">
                {essays.map((essay) => (
                  <div key={essay.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{essay.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {essay.word_count} words • {essay.readability_level} •{" "}
                        {new Date(essay.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={getPlagiarismRiskColor(essay.plagiarism_risk)}>
                        {essay.plagiarism_risk.toUpperCase()} Risk
                      </Badge>

                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">{essay.score}/100</div>
                        <div className="text-xs text-slate-600">Overall Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No essays yet</h3>
                <p className="text-slate-600 mb-4">Start analyzing your essays to see your progress here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
