import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SharedExpenseAnalytics } from "@/components/shared/shared-expense-analytics"

export default async function SharedAnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <SharedExpenseAnalytics />
    </div>
  )
}
