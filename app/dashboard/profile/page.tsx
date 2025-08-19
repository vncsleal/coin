import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ProfileSettings } from "@/components/profile-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryManager } from "@/components/category-manager"
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
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Perfil</h1>
        <p className="text-muted-foreground">Gerencie as configurações e preferências da sua conta</p>
      </div>

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
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Personalize sua experiência</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettings />
          </CardContent>
        </Card>
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
  )
}