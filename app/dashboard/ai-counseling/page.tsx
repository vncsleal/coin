import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AICounseling } from "@/components/ai-counseling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AICounselingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Financial Counseling</h1>
        <p className="text-muted-foreground">Get personalized financial advice based on your spending patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis & Advice</CardTitle>
          <CardDescription>
            Our AI analyzes your spending habits and provides personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AICounseling />
        </CardContent>
      </Card>
    </div>
  )
}
