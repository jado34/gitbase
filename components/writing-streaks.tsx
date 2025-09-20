"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Target, Calendar, TrendingUp, Award, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { GoalDialog } from "./goal-dialog"

interface WritingStreak {
  current_streak: number
  longest_streak: number
  last_essay_date: string | null
  streak_start_date: string | null
}

interface WritingGoal {
  id: string
  goal_type: string
  target_value: number
  current_progress: number
  period_start: string
  period_end: string
  is_active: boolean
}

interface DailyStats {
  date: string
  essays_written: number
  total_words: number
  average_score: number
}

interface WritingStreaksProps {
  userId: string
}

export function WritingStreaks({ userId }: WritingStreaksProps) {
  const [streak, setStreak] = useState<WritingStreak | null>(null)
  const [goals, setGoals] = useState<WritingGoal[]>([])
  const [recentStats, setRecentStats] = useState<DailyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGoalDialog, setShowGoalDialog] = useState(false)

  const fetchStreakData = async () => {
    const supabase = createClient()

    try {
      // Fetch streak data
      const { data: streakData, error: streakError } = await supabase
        .from("writing_streaks")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (streakError && streakError.code !== "PGRST116") {
        throw streakError
      }

      setStreak(
        streakData || {
          current_streak: 0,
          longest_streak: 0,
          last_essay_date: null,
          streak_start_date: null,
        },
      )

      // Fetch active goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("writing_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .gte("period_end", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: false })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])

      // Fetch recent daily stats (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: statsData, error: statsError } = await supabase
        .from("daily_writing_stats")
        .select("*")
        .eq("user_id", userId)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (statsError) throw statsError
      setRecentStats(statsData || [])
    } catch (error) {
      console.error("Error fetching streak data:", error)
      toast({
        title: "Error",
        description: "Failed to load writing streak data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStreakData()
  }, [userId])

  const getGoalTypeLabel = (goalType: string) => {
    switch (goalType) {
      case "daily_essays":
        return "Daily Essays"
      case "weekly_essays":
        return "Weekly Essays"
      case "monthly_essays":
        return "Monthly Essays"
      case "score_target":
        return "Score Target"
      default:
        return goalType
    }
  }

  const getGoalProgress = (goal: WritingGoal) => {
    return Math.min((goal.current_progress / goal.target_value) * 100, 100)
  }

  const isStreakActive = () => {
    if (!streak?.last_essay_date) return false
    const lastEssayDate = new Date(streak.last_essay_date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastEssayDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 1
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isStreakActive() ? "bg-orange-100" : "bg-gray-100"}`}>
                <Flame className={`h-6 w-6 ${isStreakActive() ? "text-orange-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{streak?.current_streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">{streak?.longest_streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {recentStats.reduce((sum, stat) => sum + stat.essays_written, 0)} essays
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Writing Goals
            </CardTitle>
            <Button onClick={() => setShowGoalDialog(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
              <p className="text-muted-foreground mb-4">Set writing goals to stay motivated and track your progress.</p>
              <Button onClick={() => setShowGoalDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getGoalTypeLabel(goal.goal_type)}</Badge>
                      <span className="font-medium">
                        {goal.current_progress} / {goal.target_value}
                        {goal.goal_type === "score_target" ? " points" : " essays"}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{Math.round(getGoalProgress(goal))}%</span>
                  </div>
                  <Progress value={getGoalProgress(goal)} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {new Date(goal.period_start).toLocaleDateString()} -{" "}
                      {new Date(goal.period_end).toLocaleDateString()}
                    </span>
                    {getGoalProgress(goal) >= 100 && (
                      <Badge variant="default" className="bg-green-600">
                        Completed!
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentStats.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-muted-foreground">Start writing essays to see your activity here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentStats.map((stat) => (
                <div key={stat.date} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(stat.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.essays_written} essay{stat.essays_written !== 1 ? "s" : ""} • {stat.total_words} words
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Avg: {Math.round(stat.average_score)}/100</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <GoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
        userId={userId}
        onGoalCreated={fetchStreakData}
      />
    </div>
  )
}
