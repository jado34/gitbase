"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, BarChart3, BookOpen, Save, Download } from "lucide-react"
import { EssayInput } from "./essay-input"
import { ScoreBreakdown } from "./score-breakdown"
import { FeedbackPanel } from "./feedback-panel"
import { PlagiarismCheck } from "./plagiarism-check"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface EssayAnalysis {
  overallScore: number
  criteria: {
    grammar: number
    structure: number
    content: number
    vocabulary: number
    coherence: number
  }
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  plagiarismRisk: "low" | "medium" | "high"
  wordCount: number
  readabilityLevel: string
}

interface EssayAnalyzerProps {
  userId: string
}

export function EssayAnalyzer({ userId }: EssayAnalyzerProps) {
  const [essay, setEssay] = useState("")
  const [essayTitle, setEssayTitle] = useState("")
  const [analysis, setAnalysis] = useState<EssayAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("input")

  const handleEssayChange = useCallback((text: string) => {
    setEssay(text)
  }, [])

  const handleTitleChange = useCallback((title: string) => {
    setEssayTitle(title)
  }, [])

  const analyzeEssay = async () => {
    if (!essay.trim()) {
      toast({
        title: "Error",
        description: "Please enter an essay to analyze.",
        variant: "destructive",
      })
      return
    }

    if (essay.trim().length < 50) {
      toast({
        title: "Error",
        description: "Essay must be at least 50 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setActiveTab("results")

    try {
      const response = await fetch("/api/score-essay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay: essay.trim(),
          title: essayTitle.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze essay")
      }

      setAnalysis(data.analysis)

      toast({
        title: "Analysis Complete!",
        description: "Your essay has been analyzed successfully.",
      })
    } catch (error) {
      console.error("Essay analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze essay. Please try again.",
        variant: "destructive",
      })
      setActiveTab("input")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveEssay = async () => {
    if (!analysis || !essay.trim()) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("essays").insert({
        user_id: userId,
        title: essayTitle || "Untitled Essay",
        content: essay,
        score: analysis.overallScore,
        criteria_scores: analysis.criteria,
        feedback: {
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
        },
        plagiarism_risk: analysis.plagiarismRisk,
        word_count: analysis.wordCount,
        readability_level: analysis.readabilityLevel,
      })

      if (error) throw error

      try {
        await fetch("/api/update-streak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            wordCount: analysis.wordCount,
            score: analysis.overallScore,
          }),
        })
      } catch (streakError) {
        console.error("Error updating streak:", streakError)
        // Don't fail the save if streak update fails
      }

      toast({
        title: "Essay Saved!",
        description: "Your essay analysis has been saved to your progress.",
      })
    } catch (error) {
      console.error("Error saving essay:", error)
      toast({
        title: "Error",
        description: "Failed to save essay. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const exportToPDF = async () => {
    if (!analysis || !essay.trim()) return

    setIsExporting(true)

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay: essay.trim(),
          title: essayTitle || "Untitled Essay",
          analysis,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate PDF")
      }

      // Create and download PDF using browser's print functionality
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(data.htmlContent)
        printWindow.document.close()

        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
        }
      }

      toast({
        title: "PDF Generated!",
        description: "Your essay analysis report is ready for download.",
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysis(null)
    setActiveTab("input")
    setEssay("")
    setEssayTitle("")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Essay Input</span>
            <span className="sm:hidden">Input</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!analysis}>
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analysis Results</span>
            <span className="sm:hidden">Results</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <EssayInput
            essay={essay}
            essayTitle={essayTitle}
            onEssayChange={handleEssayChange}
            onTitleChange={handleTitleChange}
            onAnalyze={analyzeEssay}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysis && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{analysis.overallScore}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Overall Score</h3>
                      <p className="text-sm text-muted-foreground">Out of 100</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <span>{analysis.wordCount} words</span>
                    <span className="hidden sm:inline">{analysis.readabilityLevel}</span>
                    <Badge
                      variant={
                        analysis.plagiarismRisk === "low"
                          ? "default"
                          : analysis.plagiarismRisk === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {analysis.plagiarismRisk.toUpperCase()} Risk
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">{isExporting ? "Generating..." : "Export PDF"}</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                  <Button onClick={saveEssay} disabled={isSaving} size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Essay"}</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetAnalysis}>
                    <span className="hidden sm:inline">Analyze New Essay</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <ScoreBreakdown scores={analysis.criteria} />
                  <FeedbackPanel
                    feedback={{
                      strengths: analysis.strengths,
                      weaknesses: analysis.weaknesses,
                      suggestions: analysis.suggestions,
                    }}
                  />
                </div>
                <div className="space-y-6">
                  <PlagiarismCheck
                    score={analysis.plagiarismRisk === "low" ? 10 : analysis.plagiarismRisk === "medium" ? 25 : 40}
                    risk={analysis.plagiarismRisk}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Reading Level</span>
                        <Badge variant="secondary">{analysis.readabilityLevel}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Word Count</span>
                        <span className="text-sm font-medium">{analysis.wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Plagiarism Risk</span>
                        <Badge
                          variant={
                            analysis.plagiarismRisk === "low"
                              ? "default"
                              : analysis.plagiarismRisk === "medium"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {analysis.plagiarismRisk.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
