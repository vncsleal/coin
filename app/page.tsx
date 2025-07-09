import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, PieChart, Users, Brain } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">Smart Expense Tracker</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Take control of your finances with AI-powered insights, shared expenses, and comprehensive budget tracking.
          </p>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Visualize your spending patterns with interactive charts and graphs.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PieChart className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Budget Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Set monthly budgets and track your progress with real-time updates.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Shared Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Split bills and track shared expenses with friends and family.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>AI Counseling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Get personalized financial advice and insights powered by AI.</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Features You&apos;ll Love</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Export Data</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Download your expenses as CSV files for external analysis.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Real-time Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant feedback on your spending habits and budget adherence.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">Your financial data is encrypted and securely stored.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
