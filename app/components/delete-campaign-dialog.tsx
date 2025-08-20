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

type DeleteCampaignDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string | null
  campaignTitle: string
  onSuccess: () => void
}

export function DeleteCampaignDialog({ 
  open, 
  onOpenChange, 
  campaignId, 
  campaignTitle, 
  onSuccess 
}: DeleteCampaignDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!campaignId) return

    setLoading(true)
    try {
      await apiHelpers.delete(`/api/campaigns/${campaignId}`, { 
        requiresAuth: true, 
        includeCSRF: true 
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{campaignTitle}"? This action cannot be undone.
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
            {loading ? 'Deleting...' : 'Delete Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
