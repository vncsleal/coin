"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Receipt, Wallet, Users, FileText, Download, Search, BarChart3, User, UserPlus, PieChart, Settings, LifeBuoy, LogOut, Handshake, Target, PiggyBank } from "lucide-react"
import Link from "next/link"
import Image from "next/image"


const mainNav = [
  {
    title: "Painel",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Rendas",
    url: "/dashboard/income",
    icon: Wallet,
  },
  {
    title: "Despesas",
    url: "/dashboard/expenses",
    icon: Receipt,
  },
  {
    title: "Orçamento",
    url: "/dashboard/budget",
    icon: Target,
  },
]

const toolsNav = [
  {
    title: "Análises",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Pesquisa Avançada",
    url: "/dashboard/expenses/advanced",
    icon: Search,
  },
  {
    title: "Relatórios com IA",
    url: "/dashboard/ai-reports",
    icon: FileText,
  },
  {
    title: "Exportar Dados",
    url: "/dashboard/export",
    icon: Download,
  },
]

const friendshipsNav = [
  {
    title: "Amigos",
    url: "/dashboard/friends",
    icon: Users,
  },
  {
    title: "Despesas Compartilhadas",
    url: "/dashboard/shared-expenses",
    icon: Handshake,
  },
  {
    title: "Rendas Compartilhadas",
    url: "/dashboard/shared-incomes",
    icon: PiggyBank,
  },
]



const userNav = [
  {
    title: "Configurações",
    url: "/dashboard/profile",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { user } = useUser()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-[#FAECD8] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="https://l3pden50fc.ufs.sh/f/qVxhWi9olDGtv7HTLkPK2ApQTwchMHEZ8OIegU6XizFlkxf4" alt="Cutia Logo" width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Cutia</span>
                  <span className="truncate text-xs">Finanças</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Amizades</SidebarGroupLabel>
          <SidebarMenu>
            {friendshipsNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarMenu>
            {toolsNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {userNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2">
          <UserButton afterSignOutUrl="/" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.fullName}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
