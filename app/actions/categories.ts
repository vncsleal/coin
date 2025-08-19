'use server'

import { currentUser } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

export async function getCategories(type: 'expense' | 'income') {
  const user = await currentUser()
  if (!user) return []

  const categories = user.unsafeMetadata.categories as { id: string, name: string, type: string }[] | undefined
  return categories?.filter(c => c.type === type) || []
}

export async function addCategory(name: string, type: 'expense' | 'income') {
  const user = await currentUser()
  if (!user) return

  const categories = user.unsafeMetadata.categories as { id: string, name: string, type: string }[] | undefined || []
  const newCategory = { id: crypto.randomUUID(), name, type }
  const newCategories = [...categories, newCategory]

  await clerkClient.users.updateUser(user.id, {
    unsafeMetadata: { ...user.unsafeMetadata, categories: newCategories },
  })
}

export async function updateCategory(id: string, name: string) {
  const user = await currentUser()
  if (!user) return

  const categories = user.unsafeMetadata.categories as { id: string, name: string, type: string }[] | undefined || []
  const newCategories = categories.map(c => c.id === id ? { ...c, name } : c)

  await clerkClient.users.updateUser(user.id, {
    unsafeMetadata: { ...user.unsafeMetadata, categories: newCategories },
  })
}

export async function deleteCategory(id: string) {
  const user = await currentUser()
  if (!user) return

  const categories = user.unsafeMetadata.categories as { id: string, name: string, type: string }[] | undefined || []
  const newCategories = categories.filter(c => c.id !== id)

  await clerkClient.users.updateUser(user.id, {
    unsafeMetadata: { ...user.unsafeMetadata, categories: newCategories },
  })
}
