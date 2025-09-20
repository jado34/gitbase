"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onGoalCreated: () => void
}

export function GoalDialog({ open, onOpenChange, userId, onGoalCreated }: GoalDialogProps) {
  const [goalType, setGoalType] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGoal = async () => {
    if (!goalType || !targetValue) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    const target = Number.parseInt(targetValue)
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Error",
        description: "Target value must be a positive number.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    const supabase = createClient()

    try {
      let periodStart = new Date()
      let periodEnd = new Date()

      // Set period based on goal type
      switch (goalType) {
        case "daily_essays":
          periodEnd = new Date(periodStart)
          periodEnd.setDate(periodEnd.getDate() + 1)
          break
        case "weekly_essays":
          periodStart = new Date(periodStart.setDate(periodStart.getDate() - periodStart.getDay()))
          periodEnd = new Date(periodStart)
          periodEnd.setDate(periodEnd.getDate() + 6)
          break
        case "monthly_essays":
          periodStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1)
          periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)
          break
        case "score_target":
          periodEnd = new Date(periodStart)
          periodEnd.setMonth(periodEnd.getMonth() + 3) // 3 month target
          break
      }

      const { error } = await supabase.from("writing_goals").insert({
        user_id: userId,
        goal_type: goalType,
        target_value: target,
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
      })

      if (error) throw error

      toast({
        title: "Goal Created!",
        description: "Your writing goal has been set successfully.",
      })

      onGoalCreated()
      onOpenChange(false)
      setGoalType("")
      setTargetValue("")
    } catch (error) {
      console.error("Error creating goal:", error)
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getGoalDescription = (type: string) => {
    switch (type) {
      case "daily_essays":
        return "Write a specific number of essays each day"
      case "weekly_essays":
        return "Write a specific number of essays each week"
      case "monthly_essays":
        return "Write a specific number of essays each month"
      case "score_target":
        return "Achieve a target score within 3 months"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Writing Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-type">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily_essays">Daily Essays</SelectItem>
                <SelectItem value="weekly_essays">Weekly Essays</SelectItem>
                <SelectItem value="monthly_essays">Monthly Essays</SelectItem>
                <SelectItem value="score_target">Score Target</SelectItem>
              </SelectContent>
            </Select>
            {goalType && <p className="text-sm text-muted-foreground">{getGoalDescription(goalType)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-value">Target {goalType === "score_target" ? "Score" : "Number of Essays"}</Label>
            <Input
              id="target-value"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={goalType === "score_target" ? "e.g., 85" : "e.g., 5"}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} disabled={isCreating || !goalType || !targetValue} className="flex-1">
              {isCreating ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
