import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ProfileSettings } from "@/components/profile-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryManager } from "@/components/category-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemePreviewGrid } from "@/components/theme-preview-grid"
import { User, Settings, FolderOpen, Palette } from "lucide-react"
import { getCategories } from "@/app/actions/categories"

export default async function ProfilePage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }

  const expenseCategories = await getCategories('expense')
  const incomeCategories = await getCategories('income')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações e preferências da sua conta</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Temas</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Categorias</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Seus detalhes básicos da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-sm text-muted-foreground">{user.fullName || "Não definido"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Membro Desde</label>
                  <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Conta</CardTitle>
                <CardDescription>Resumo da sua atividade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Último Login</label>
                  <p className="text-sm text-muted-foreground">{new Date(user.lastSignInAt || user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status da Conta</label>
                  <p className="text-sm text-muted-foreground">Ativa</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID do Usuário</label>
                  <p className="text-xs text-muted-foreground font-mono">{userId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Aplicativo</CardTitle>
              <CardDescription>Personalize sua experiência com o Cutia</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings compact={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização Visual</CardTitle>
              <CardDescription>Escolha um tema que combine com seu estilo e preferências</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePreviewGrid />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Gerenciamento de Categorias</h3>
              <p className="text-sm text-muted-foreground">
                Crie e organize suas categorias de despesas e rendas para melhor controle financeiro
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <CategoryManager 
                initialCategories={expenseCategories} 
                type="expense" 
                title="Categorias de Despesa"
                description="Gerencie suas categorias de despesa"
              />
              <CategoryManager 
                initialCategories={incomeCategories} 
                type="income" 
                title="Categorias de Renda"
                description="Gerencie suas categorias de renda"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}