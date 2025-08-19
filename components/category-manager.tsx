'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/components/category-form"
import { getCategories, deleteCategory } from "@/app/actions/categories"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash } from "lucide-react"

interface CategoryManagerProps {
  initialCategories: { id: string, name: string, type: string }[];
  type: 'expense' | 'income';
  title: string;
  description: string;
}

export function CategoryManager({ initialCategories, type, title, description }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | undefined>(undefined);
  const { toast } = useToast();

  const handleSave = async () => {
    const updatedCategories = await getCategories(type);
    setCategories(updatedCategories);
    setEditingCategory(undefined);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      const updatedCategories = await getCategories(type);
      setCategories(updatedCategories);
      toast({
        title: "Sucesso",
        description: "Categoria deletada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryForm type={type} onSave={handleSave} categoryToEdit={editingCategory} />
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between rounded-lg border p-2">
              <span>{category.name}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
