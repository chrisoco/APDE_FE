import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button } from './button'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface FormLayoutProps {
  title: string
  description: string
  backPath: string
  isLoading?: boolean
  children: ReactNode
}

export function FormLayout({ 
  title, 
  description, 
  backPath, 
  isLoading = false,
  children 
}: FormLayoutProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(backPath)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          <h2 className="text-xl font-semibold">Details</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {children}
      </div>
    </div>
  )
}