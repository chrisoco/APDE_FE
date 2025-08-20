import { Button } from './button'

interface FormActionsProps {
  isEditing: boolean
  isLoading: boolean
  onCancel: () => void
}

export function FormActions({ isEditing, isLoading, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading 
          ? (isEditing ? 'Updating...' : 'Creating...') 
          : (isEditing ? 'Update' : 'Create')
        }
      </Button>
    </div>
  )
}