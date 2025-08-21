import { useState } from 'react'
import { useNavigate, useRevalidator } from 'react-router'
import { apiHelpers } from '~/lib/api'
import { cacheManager } from '~/lib/cache-manager'

interface UseAdminActionsOptions {
  basePath: string
  endpoint: string
  cacheKey?: string
}

interface DeleteItem {
  id: string
  title: string
}

export function useAdminActions({ basePath, endpoint, cacheKey }: UseAdminActionsOptions) {
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (itemId: string) => {
    navigate(`${basePath}/${itemId}/edit`)
  }

  const handleDelete = (item: any) => {
    setItemToDelete({ id: item.id, title: item.title })
    setDeleteOpen(true)
  }

  const handleCreate = () => {
    navigate(`${basePath}/create`)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    try {
      await apiHelpers.delete(`${endpoint}/${itemToDelete.id}`, {
        requiresAuth: true,
        includeCSRF: true
      })
      
      setDeleteOpen(false)
      setItemToDelete(null)
      
      // Invalidate cache if cacheKey provided
      if (cacheKey) {
        cacheManager.invalidate(cacheKey)
      }
      
      // Revalidate the route data
      revalidator.revalidate()
    } catch (error) {
      console.error('Delete failed:', error)
      // Handle error (could set error state here)
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteOpen,
    setDeleteOpen,
    itemToDelete,
    isDeleting,
    handleEdit,
    handleDelete,
    handleCreate,
    handleDeleteConfirm
  }
}