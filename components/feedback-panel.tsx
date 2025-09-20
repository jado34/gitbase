"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Lightbulb } from "lucide-react"

interface FeedbackPanelProps {
  feedback: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedback.strengths.map((strength, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <p className="text-sm">{strength}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            Areas to Improve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedback.weaknesses.map((weakness, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <p className="text-sm">{weakness}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedback.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
