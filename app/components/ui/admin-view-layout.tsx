import { DataTable } from './data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface AdminViewLayoutProps<T> {
  title: string
  data: any
  columns: ColumnDef<T>[]
  loading: boolean
  error: string | null
}

export function AdminViewLayout<T>({
  title,
  data,
  columns,
  loading,
  error
}: AdminViewLayoutProps<T>) {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      <DataTable 
        columns={columns} 
        data={data?.data || []} 
      />
    </div>
  )
}