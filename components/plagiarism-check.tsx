"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

interface PlagiarismCheckProps {
  score: number
  risk?: "low" | "medium" | "high"
}

export function PlagiarismCheck({ score, risk }: PlagiarismCheckProps) {
  const getPlagiarismStatus = (score: number, risk?: string) => {
    // Use risk if provided, otherwise fall back to score-based detection
    if (risk) {
      switch (risk) {
        case "low":
          return { status: "Low Risk", color: "text-green-600", icon: CheckCircle, variant: "default" }
        case "medium":
          return { status: "Medium Risk", color: "text-yellow-600", icon: AlertTriangle, variant: "secondary" }
        case "high":
          return { status: "High Risk", color: "text-red-600", icon: AlertTriangle, variant: "destructive" }
        default:
          break
      }
    }

    // Fallback to score-based detection
    if (score <= 15) return { status: "Low Risk", color: "text-green-600", icon: CheckCircle, variant: "default" }
    if (score <= 30)
      return { status: "Medium Risk", color: "text-yellow-600", icon: AlertTriangle, variant: "secondary" }
    return { status: "High Risk", color: "text-red-600", icon: AlertTriangle, variant: "destructive" }
  }

  const plagiarismStatus = getPlagiarismStatus(score, risk)
  const StatusIcon = plagiarismStatus.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Plagiarism Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StatusIcon className={`h-5 w-5 ${plagiarismStatus.color}`} />
            <span className={`text-2xl font-bold ${plagiarismStatus.color}`}>{score}%</span>
          </div>
          <Badge variant={plagiarismStatus.variant as any}>{plagiarismStatus.status}</Badge>
        </div>

        <Progress value={score} className="h-3" />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 0-15%: Original content</p>
          <p>• 16-30%: Some similarities found</p>
          <p>• 31%+: Significant similarities detected</p>
        </div>

        {(risk === "medium" || risk === "high" || score > 15) && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {risk === "high" || score > 30
                ? "High similarity detected. Please review your content and ensure proper citations."
                : "Consider reviewing highlighted sections and ensuring proper citations."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
