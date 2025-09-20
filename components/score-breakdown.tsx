"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, BookOpen, MessageSquare, Zap, Link } from "lucide-react"

interface ScoreBreakdownProps {
  scores: {
    grammar: number
    content: number
    structure: number
    vocabulary: number
    coherence: number
  }
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const scoreCategories = [
    {
      name: "Grammar",
      score: scores.grammar,
      icon: BookOpen,
      description: "Spelling, punctuation, and syntax",
    },
    {
      name: "Content",
      score: scores.content,
      icon: MessageSquare,
      description: "Relevance, depth, and accuracy",
    },
    {
      name: "Structure",
      score: scores.structure,
      icon: BarChart3,
      description: "Organization and flow",
    },
    {
      name: "Vocabulary",
      score: scores.vocabulary,
      icon: Zap,
      description: "Word choice and variety",
    },
    {
      name: "Coherence",
      score: scores.coherence,
      icon: Link,
      description: "Logical connections and clarity",
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Improvement"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {scoreCategories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(category.score)}`}>{category.score}/100</span>
                  <Badge variant={getScoreBadgeVariant(category.score) as any}>{getScoreBadge(category.score)}</Badge>
                </div>
              </div>
              <Progress value={category.score} className="h-2" />
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
