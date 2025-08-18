import { ReactNode } from 'react'
import { Label } from './label'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}