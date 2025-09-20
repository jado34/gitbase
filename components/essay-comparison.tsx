"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, BarChart3, Calendar } from "lucide-react"
import { format } from "date-fns"

interface Essay {
  id: string
  title: string
  content: string
  overall_score: number
  grammar_score: number
  content_score: number
  structure_score: number
  vocabulary_score: number
  coherence_score: number
  word_count: number
  plagiarism_risk: string
  created_at: string
}

interface EssayComparisonProps {
  essays: Essay[]
  userId: string
}

export function EssayComparison({ essays }: EssayComparisonProps) {
  const [selectedEssay1, setSelectedEssay1] = useState<Essay | null>(null)
  const [selectedEssay2, setSelectedEssay2] = useState<Essay | null>(null)

  const scoreCategories = [
    { key: "overall_score", name: "Overall Score", max: 100 },
    { key: "grammar_score", name: "Grammar", max: 100 },
    { key: "content_score", name: "Content", max: 100 },
    { key: "structure_score", name: "Structure", max: 100 },
    { key: "vocabulary_score", name: "Vocabulary", max: 100 },
    { key: "coherence_score", name: "Coherence", max: 100 },
  ]

  const getScoreDifference = (score1: number, score2: number) => {
    const diff = score1 - score2
    return {
      value: Math.abs(diff),
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "same",
      percentage: score2 > 0 ? ((diff / score2) * 100).toFixed(1) : "0",
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (essays.length < 2) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Not Enough Essays</h3>
          <p className="text-muted-foreground mb-4">You need at least 2 essays to use the comparison feature.</p>
          <Button asChild>
            <a href="/dashboard">Analyze More Essays</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Essay Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Select Essays to Compare
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Essay</label>
            <Select
              value={selectedEssay1?.id || ""}
              onValueChange={(value) => {
                const essay = essays.find((e) => e.id === value)
                setSelectedEssay1(essay || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first essay..." />
              </SelectTrigger>
              <SelectContent>
                {essays.map((essay) => (
                  <SelectItem key={essay.id} value={essay.id} disabled={essay.id === selectedEssay2?.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate max-w-32 sm:max-w-48">{essay.title}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="secondary">{essay.overall_score}/100</Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {format(new Date(essay.created_at), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Second Essay</label>
            <Select
              value={selectedEssay2?.id || ""}
              onValueChange={(value) => {
                const essay = essays.find((e) => e.id === value)
                setSelectedEssay2(essay || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second essay..." />
              </SelectTrigger>
              <SelectContent>
                {essays.map((essay) => (
                  <SelectItem key={essay.id} value={essay.id} disabled={essay.id === selectedEssay1?.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate max-w-32 sm:max-w-48">{essay.title}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="secondary">{essay.overall_score}/100</Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {format(new Date(essay.created_at), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedEssay1 && selectedEssay2 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Essay 1 Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="truncate">{selectedEssay1.title}</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedEssay1.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Word Count:</span>
                  <span className="ml-2 font-medium">{selectedEssay1.word_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Plagiarism Risk:</span>
                  <Badge
                    variant={
                      selectedEssay1.plagiarism_risk === "low"
                        ? "default"
                        : selectedEssay1.plagiarism_risk === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                    className="ml-2"
                  >
                    {selectedEssay1.plagiarism_risk.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {scoreCategories.map((category) => {
                const score = selectedEssay1[category.key as keyof Essay] as number
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-bold">
                        {score}/{category.max}
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Essay 2 Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="truncate">{selectedEssay2.title}</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedEssay2.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Word Count:</span>
                  <span className="ml-2 font-medium">{selectedEssay2.word_count}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Plagiarism Risk:</span>
                  <Badge
                    variant={
                      selectedEssay2.plagiarism_risk === "low"
                        ? "default"
                        : selectedEssay2.plagiarism_risk === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                    className="ml-2"
                  >
                    {selectedEssay2.plagiarism_risk.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {scoreCategories.map((category) => {
                const score = selectedEssay2[category.key as keyof Essay] as number
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-bold">
                        {score}/{category.max}
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Score Comparison Summary */}
      {selectedEssay1 && selectedEssay2 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {scoreCategories.map((category) => {
                const score1 = selectedEssay1[category.key as keyof Essay] as number
                const score2 = selectedEssay2[category.key as keyof Essay] as number
                const diff = getScoreDifference(score1, score2)

                return (
                  <div key={category.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(diff.trend)}
                        <span className={`text-sm font-bold ${getTrendColor(diff.trend)}`}>
                          {diff.trend === "same" ? "No change" : `${diff.value} pts`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {score2} → {score1}
                      </p>
                      {diff.trend !== "same" && (
                        <p className={`text-xs ${getTrendColor(diff.trend)}`}>
                          {diff.trend === "up" ? "+" : "-"}
                          {diff.percentage}%
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
