import type { FilterValue } from "~/components/ui/search-filter"

/**
 * Transforms the internal filter format to the API format
 * 
 * Internal format: { min_age: 25, max_age: 94, gender: "female", blood_group: ["AB-", "O-"] }
 * API format: { age: { min: 25, max: 94 }, gender: "female", blood_group: ["AB-", "O-"] }
 */
export function transformFilterForAPI(filter: FilterValue): Record<string, any> {
  const apiFilter: Record<string, any> = {}
  
  // Track which fields have min/max pairs
  const rangeFields = new Set<string>()
  
  // First pass: identify range fields and simple fields
  Object.entries(filter).forEach(([key, value]) => {
    if (key.startsWith('min_') || key.startsWith('max_')) {
      const fieldName = key.replace(/^(min_|max_)/, '')
      rangeFields.add(fieldName)
    } else {
      // Direct mapping for non-range fields
      apiFilter[key] = value
    }
  })
  
  // Second pass: build range objects
  rangeFields.forEach(fieldName => {
    const minKey = `min_${fieldName}`
    const maxKey = `max_${fieldName}`
    const minValue = filter[minKey]
    const maxValue = filter[maxKey]
    
    if (minValue !== undefined || maxValue !== undefined) {
      const rangeObj: any = {}
      if (minValue !== undefined) rangeObj.min = minValue
      if (maxValue !== undefined) rangeObj.max = maxValue
      
      // Only add if we have at least one value
      if (Object.keys(rangeObj).length > 0) {
        apiFilter[fieldName] = rangeObj
      }
    }
  })
  
  return apiFilter
}

/**
 * Transforms API format back to internal format for editing
 * 
 * API format: { age: { min: 25, max: 94 }, gender: "female" }
 * Internal format: { min_age: 25, max_age: 94, gender: "female" }
 */
export function transformFilterFromAPI(apiFilter: Record<string, any>): FilterValue {
  const internalFilter: FilterValue = {}
  
  Object.entries(apiFilter).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a range object
      if ('min' in value || 'max' in value) {
        if (value.min !== undefined) {
          internalFilter[`min_${key}`] = value.min
        }
        if (value.max !== undefined) {
          internalFilter[`max_${key}`] = value.max
        }
      } else {
        // Regular object, keep as is
        internalFilter[key] = value
      }
    } else {
      // Direct mapping - keep exact values as they are
      // The UI will determine how to display them based on the field type
      internalFilter[key] = value
    }
  })
  
  return internalFilter
}

// Legacy functions for backward compatibility
export const transformProspectFilterForAPI = transformFilterForAPI
export const transformProspectFilterFromAPI = transformFilterFromAPI