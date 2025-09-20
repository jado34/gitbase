import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { essay, title, analysis } = await request.json()

    if (!essay || !analysis) {
      return Response.json({ error: "Essay and analysis data required" }, { status: 400 })
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Essay Analysis Report</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .score-section {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .criteria-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 15px 0;
            }
            .criteria-item {
              background: white;
              padding: 10px;
              border-radius: 4px;
              border-left: 4px solid #2563eb;
            }
            .feedback-section {
              margin: 25px 0;
              padding: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
            .essay-content {
              background: #fafafa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              white-space: pre-wrap;
              font-family: 'Georgia', serif;
            }
            h1 { color: #1e40af; margin-bottom: 10px; }
            h2 { color: #2563eb; margin-top: 25px; }
            h3 { color: #3b82f6; margin-top: 20px; }
            .score { font-weight: bold; color: #059669; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
            .meta-info {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .meta-item {
              text-align: center;
              padding: 10px;
              background: #f1f5f9;
              border-radius: 6px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .score-section, .feedback-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Essay Analysis Report</h1>
            <p><strong>${title || "Untitled Essay"}</strong></p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="score-section">
            <h2>Overall Score: <span class="score">${analysis.overallScore}/100</span></h2>
            
            <div class="meta-info">
              <div class="meta-item">
                <strong>Word Count</strong><br>
                ${analysis.wordCount} words
              </div>
              <div class="meta-item">
                <strong>Reading Level</strong><br>
                ${analysis.readabilityLevel}
              </div>
              <div class="meta-item">
                <strong>Plagiarism Risk</strong><br>
                ${analysis.plagiarismRisk.toUpperCase()}
              </div>
            </div>

            <h3>Detailed Criteria Scores</h3>
            <div class="criteria-grid">
              <div class="criteria-item">
                <strong>Grammar & Mechanics:</strong> <span class="score">${analysis.criteria.grammar}/100</span>
              </div>
              <div class="criteria-item">
                <strong>Structure & Organization:</strong> <span class="score">${analysis.criteria.structure}/100</span>
              </div>
              <div class="criteria-item">
                <strong>Content Quality:</strong> <span class="score">${analysis.criteria.content}/100</span>
              </div>
              <div class="criteria-item">
                <strong>Vocabulary Usage:</strong> <span class="score">${analysis.criteria.vocabulary}/100</span>
              </div>
              <div class="criteria-item">
                <strong>Coherence & Flow:</strong> <span class="score">${analysis.criteria.coherence}/100</span>
              </div>
            </div>
          </div>

          <div class="feedback-section">
            <h2>Strengths</h2>
            <ul>
              ${analysis.strengths.map((strength: string) => `<li>${strength}</li>`).join("")}
            </ul>

            <h2>Areas for Improvement</h2>
            <ul>
              ${analysis.weaknesses.map((weakness: string) => `<li>${weakness}</li>`).join("")}
            </ul>

            <h2>Improvement Suggestions</h2>
            <ul>
              ${analysis.suggestions.map((suggestion: string) => `<li>${suggestion}</li>`).join("")}
            </ul>
          </div>

          <div class="essay-content">
            <h2>Original Essay</h2>
            ${essay}
          </div>
        </body>
      </html>
    `

    return Response.json({
      success: true,
      htmlContent,
      filename: `essay-analysis-${title?.replace(/[^a-zA-Z0-9]/g, "-") || "untitled"}-${Date.now()}.pdf`,
    })
  } catch (error) {
    console.error("PDF export error:", error)
    return Response.json(
      {
        error: "Failed to generate PDF. Please try again.",
      },
      { status: 500 },
    )
  }
}
