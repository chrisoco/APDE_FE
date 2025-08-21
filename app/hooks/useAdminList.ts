import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { apiHelpers } from '~/lib/api'
import type { PaginatedResponse } from '~/lib/types'

interface UseAdminListOptions {
  endpoint: string
  basePath: string
}

interface DeleteItem {
  id: string
  title: string
}

export function useAdminList<T>({ endpoint, basePath }: UseAdminListOptions) {
  const navigate = useNavigate()
  const [data, setData] = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await apiHelpers.paginated<PaginatedResponse<T>>(
        endpoint,
        { page: 1, per_page: 100 },
        { requiresAuth: true }
      )
      setData(response)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [endpoint])

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

  const handleDeleteSuccess = () => {
    fetchData() // Refetch data after successful deletion
  }

  const refetch = fetchData

  return {
    data,
    loading,
    error,
    deleteOpen,
    setDeleteOpen,
    itemToDelete,
    handleEdit,
    handleDelete,
    handleCreate,
    handleDeleteSuccess,
    refetch
  }
}