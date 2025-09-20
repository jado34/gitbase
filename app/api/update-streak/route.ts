import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, wordCount, score } = await request.json()

    if (!userId || !wordCount || !score) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Update writing streak
    const { error: streakError } = await supabase.rpc("update_writing_streak", {
      p_user_id: userId,
    })

    if (streakError) {
      console.error("Error updating streak:", streakError)
      throw streakError
    }

    // Update daily stats
    const { error: statsError } = await supabase.rpc("update_daily_stats", {
      p_user_id: userId,
      p_word_count: wordCount,
      p_score: score,
    })

    if (statsError) {
      console.error("Error updating daily stats:", statsError)
      throw statsError
    }

    // Update goal progress
    const { error: goalError } = await supabase.rpc("update_goal_progress", {
      p_user_id: userId,
    })

    if (goalError) {
      console.error("Error updating goal progress:", goalError)
      throw goalError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-streak API:", error)
    return NextResponse.json({ error: "Failed to update streak data" }, { status: 500 })
  }
}
