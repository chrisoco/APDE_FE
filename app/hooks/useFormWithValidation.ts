import { useState } from 'react'
import { apiHelpers } from '~/lib/api'

export type ValidationErrors = {
  [key: string]: string[]
}

export interface UseFormWithValidationOptions<T> {
  initialData: T
  endpoint: string
  redirectPath: string
  onSuccess?: () => void
}

export function useFormWithValidation<T>({
  initialData,
  endpoint,
  redirectPath,
  onSuccess
}: UseFormWithValidationOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)

  const getFieldError = (field: string) => {
    return errors[field]?.[0]
  }

  const clearErrors = () => {
    setErrors({})
  }

  const parseApiError = (error: any) => {
    if (error.message.includes('API Error:')) {
      try {
        const errorMessage = error.message.replace('API Error: ', '')
        const statusMatch = errorMessage.match(/^(\d+)\s+(.+)/)
        if (statusMatch && statusMatch[2]) {
          const errorData = JSON.parse(statusMatch[2])
          if (errorData.errors) {
            setErrors(errorData.errors)
          }
        }
      } catch (parseError) {
        console.error('Failed to parse error:', error)
      }
    }
  }

  const submitForm = async (
    submitData: any,
    options: { 
      isEditing: boolean
      id?: string
    }
  ) => {
    setLoading(true)
    setErrors({})

    try {
      if (options.isEditing && options.id) {
        await apiHelpers.put(`${endpoint}/${options.id}`, submitData, { 
          requiresAuth: true, 
          includeCSRF: true 
        })
      } else {
        await apiHelpers.post(endpoint, submitData, { 
          requiresAuth: true, 
          includeCSRF: true 
        })
      }

      onSuccess?.()
      return true
    } catch (error: any) {
      parseApiError(error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return {
    formData,
    setFormData,
    updateFormData,
    errors,
    loading,
    getFieldError,
    clearErrors,
    submitForm
  }
}