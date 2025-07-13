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
import { LayoutDashboard, Receipt, Wallet, Users, Brain, Download, Search, BarChart3, User, UserPlus, PieChart } from "lucide-react"
import Link from "next/link"

const items = [
  {
    title: "Painel",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Despesas",
    url: "/dashboard/expenses",
    icon: Receipt,
  },
  {
    title: "Pesquisa Avançada",
    url: "/dashboard/expenses/advanced",
    icon: Search,
  },
  {
    title: "Análises",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Orçamento",
    url: "/dashboard/budget",
    icon: Wallet,
  },
  {
    title: "Despesas Compartilhadas",
    url: "/dashboard/shared",
    icon: Users,
  },
  {
    title: "Análises Compartilhadas",
    url: "/dashboard/shared/analytics",
    icon: PieChart,
  },
  {
    title: "Amigos",
    url: "/dashboard/friends",
    icon: UserPlus,
  },
  {
    title: "Aconselhamento com IA",
    url: "/dashboard/ai-counseling",
    icon: Brain,
  },
  {
    title: "Exportar Dados",
    url: "/dashboard/export",
    icon: Download,
  },
  {
    title: "Perfil",
    url: "/dashboard/profile",
    icon: User,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Rastreador de Despesas</SidebarGroupLabel>
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
