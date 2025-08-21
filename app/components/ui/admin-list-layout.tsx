import { Button } from './button'
import { DataTable } from './data-table'
import { DeleteDialog } from './delete-dialog'
import { Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { PaginatedResponse } from '~/lib/types'

interface AdminListLayoutProps<T> {
  title: string
  createButtonText: string
  entityType: string
  endpoint: string
  data: PaginatedResponse<T> | null
  columns: ColumnDef<T>[]
  loading: boolean
  error: string | null
  deleteOpen: boolean
  setDeleteOpen: (open: boolean) => void
  itemToDelete: { id: string; title: string } | null
  onCreate: () => void
  onDeleteSuccess: () => void
}

export function AdminListLayout<T>({
  title,
  createButtonText,
  entityType,
  endpoint,
  data,
  columns,
  loading,
  error,
  deleteOpen,
  setDeleteOpen,
  itemToDelete,
  onCreate,
  onDeleteSuccess
}: AdminListLayoutProps<T>) {
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {createButtonText}
        </Button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={data?.data || []} 
        searchKey="title"
        searchPlaceholder={`Filter ${title.toLowerCase()}...`}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityType={entityType}
        entityName={itemToDelete?.title || ''}
        entityId={itemToDelete?.id || null}
        endpoint={endpoint}
        onSuccess={onDeleteSuccess}
      />
    </div>
  )
}