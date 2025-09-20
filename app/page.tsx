import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BarChart3, Shield, Lightbulb } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (data?.user && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <Navbar user={data.user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4 text-balance">Welcome back to Essay Scorer</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty mb-6">
              Ready to analyze your next essay? Head to your dashboard to get started.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <FileText className="w-5 h-5" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 text-balance">
            Automated Essay Scoring & Feedback System
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty mb-8">
            Get instant feedback on your essays with AI-powered scoring, plagiarism detection, and detailed improvement
            suggestions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <FileText className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Multiple Input Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Type, upload documents, or paste your essays with real-time word counting.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <CardTitle className="text-lg">AI-Powered Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Get detailed scores for grammar, content, structure, vocabulary, and coherence.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Plagiarism Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Advanced plagiarism checking with similarity percentages and risk assessment.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Lightbulb className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Actionable Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Receive specific suggestions and improvement tips to enhance your writing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to improve your writing?</h2>
            <p className="text-lg mb-6 text-amber-50">
              Join thousands of students and writers who use our AI-powered essay analysis.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Analyzing Essays
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
