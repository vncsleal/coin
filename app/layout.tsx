import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ptBR } from '@clerk/localizations'
import MobileSplashScreen from "@/components/mobile-splash-screen"
import SplashScreenWrapper from "@/components/splash-screen-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: {
    default: "Cutia - Controle Financeiro Inteligente",
    template: "%s | Cutia"
  },
  description: "Acompanhe suas receitas e despesas com insights alimentados por IA. Gerencie seu orçamento, analise gastos e tome decisões financeiras inteligentes.",
  keywords: ["finanças", "orçamento", "controle financeiro", "gastos", "receitas", "IA", "relatórios"],
  authors: [{ name: "Vini.co" }],
  creator: "vncsleal",
  publisher: "vncsleal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://vinicoin.netlify.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cutia - Controle Financeiro Inteligente",
    description: "Acompanhe suas receitas e despesas com insights alimentados por IA",
    url: "https://vinicoin.netlify.app/",
    siteName: "Cutia",
    images: [
      {
        url: "/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "Cutia - Controle Financeiro Inteligente",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cutia - Controle Financeiro Inteligente",
    description: "Acompanhe suas receitas e despesas com insights alimentados por IA",
    images: ["/placeholder-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/placeholder-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/placeholder-logo.png",
  },
  manifest: "/manifest.json",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" enableSystem={false} disableTransitionOnChange>
            <SplashScreenWrapper>
              {children}
            </SplashScreenWrapper>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
