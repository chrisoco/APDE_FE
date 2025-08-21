import { useState } from 'react'
import { useRevalidator } from 'react-router'
import { apiHelpers } from '~/lib/api'
import { cacheManager } from '~/lib/cache-manager'

type ValidationErrors = {
  [key: string]: string[]
}

interface UseFormWithValidationOptions<T> {
  initialData: T
  endpoint: string
  redirectPath: string
  cacheKey?: string
  onSuccess?: () => void
}

export function useFormWithValidation<T>({
  initialData,
  endpoint,
  redirectPath: _redirectPath,
  cacheKey,
  onSuccess
}: UseFormWithValidationOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const revalidator = useRevalidator()

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
      } catch {
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

      // Invalidate cache if cacheKey provided
      if (cacheKey) {
        cacheManager.invalidate(cacheKey)
      }
      
      // Revalidate route data
      revalidator.revalidate()

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