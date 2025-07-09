import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Receipt, Wallet, Users, Brain, Download, Search, BarChart3, User } from "lucide-react"
import Link from "next/link"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Expenses",
    url: "/dashboard/expenses",
    icon: Receipt,
  },
  {
    title: "Advanced Search",
    url: "/dashboard/expenses/advanced",
    icon: Search,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Budget",
    url: "/dashboard/budget",
    icon: Wallet,
  },
  {
    title: "Shared Expenses",
    url: "/dashboard/shared",
    icon: Users,
  },
  {
    title: "AI Counseling",
    url: "/dashboard/ai-counseling",
    icon: Brain,
  },
  {
    title: "Export Data",
    url: "/dashboard/export",
    icon: Download,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Expense Tracker</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
