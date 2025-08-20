import { useState } from "react"
import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { apiHelpers } from "~/lib/api"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string
  entityName: string
  entityId: string | null
  endpoint: string
  onSuccess: () => void
}

export function DeleteDialog({ 
  open, 
  onOpenChange, 
  entityType,
  entityName,
  entityId, 
  endpoint,
  onSuccess 
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!entityId) return

    setLoading(true)
    try {
      await apiHelpers.delete(`${endpoint}/${entityId}`, { 
        requiresAuth: true, 
        includeCSRF: true 
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(`Failed to delete ${entityType.toLowerCase()}:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete {entityType}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{entityName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : `Delete ${entityType}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}