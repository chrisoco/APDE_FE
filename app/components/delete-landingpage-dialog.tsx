import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { apiHelpers } from "~/lib/api"

type DeleteLandingpageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  landingpageId: string | null
  landingpageTitle: string
  onSuccess: () => void
}

export function DeleteLandingpageDialog({ 
  open, 
  onOpenChange, 
  landingpageId, 
  landingpageTitle, 
  onSuccess 
}: DeleteLandingpageDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!landingpageId) return

    setLoading(true)
    try {
      await apiHelpers.delete(`/api/landingpages/${landingpageId}`, { 
        requiresAuth: true, 
        includeCSRF: true 
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete landing page:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Landing Page</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{landingpageTitle}"? This action cannot be undone.
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
            {loading ? 'Deleting...' : 'Delete Landing Page'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}