import { generateObject } from "ai"
import { xai } from "@ai-sdk/xai"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const essayScoreSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall essay score out of 100"),
  criteria: z.object({
    grammar: z.number().min(0).max(100).describe("Grammar and mechanics score"),
    structure: z.number().min(0).max(100).describe("Essay structure and organization score"),
    content: z.number().min(0).max(100).describe("Content quality and depth score"),
    vocabulary: z.number().min(0).max(100).describe("Vocabulary usage and variety score"),
    coherence: z.number().min(0).max(100).describe("Coherence and flow score"),
  }),
  strengths: z.array(z.string()).describe("List of essay strengths"),
  weaknesses: z.array(z.string()).describe("List of areas for improvement"),
  suggestions: z.array(z.string()).describe("Specific improvement suggestions"),
  plagiarismRisk: z.enum(["low", "medium", "high"]).describe("Plagiarism risk assessment"),
  wordCount: z.number().describe("Actual word count of the essay"),
  readabilityLevel: z.string().describe('Reading level assessment (e.g., "Grade 10", "College Level")'),
})

export async function POST(request: Request) {
  try {
    const { essay, title } = await request.json()

    if (!essay || essay.trim().length < 50) {
      return Response.json({ error: "Essay must be at least 50 characters long" }, { status: 400 })
    }

    const result = await generateObject({
      model: xai("grok-4"),
      schema: essayScoreSchema,
      prompt: `Analyze this essay comprehensively and provide detailed scoring and feedback:

Title: ${title || "Untitled Essay"}

Essay:
${essay}

Please provide:
1. Detailed scoring for each criterion (0-100)
2. Specific strengths and weaknesses
3. Actionable improvement suggestions
4. Plagiarism risk assessment based on writing patterns
5. Reading level assessment

Be thorough, constructive, and educational in your feedback.`,
      maxOutputTokens: 2000,
    })

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("essays").insert({
          user_id: user.id,
          title: title || "Untitled Essay",
          content: essay,
          score: result.object.overallScore,
          criteria_scores: result.object.criteria,
          feedback: {
            strengths: result.object.strengths,
            weaknesses: result.object.weaknesses,
            suggestions: result.object.suggestions,
          },
          plagiarism_risk: result.object.plagiarismRisk,
          word_count: result.object.wordCount,
          readability_level: result.object.readabilityLevel,
        })
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Continue with response even if DB save fails
    }

    return Response.json({
      success: true,
      analysis: result.object,
    })
  } catch (error) {
    console.error("Essay scoring error:", error)
    return Response.json(
      {
        error: "Failed to analyze essay. Please try again.",
      },
      { status: 500 },
    )
  }
}
