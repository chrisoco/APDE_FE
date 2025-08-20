"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { RangeSlider } from "~/components/ui/range-slider"
import { MultiSelect } from "~/components/ui/multi-select"
import { Combobox } from "~/components/ui/combobox"
import { DatePicker } from "~/components/ui/date-picker"
import { Badge } from "~/components/ui/badge"
import { apiHelpers } from "~/lib/api"

export interface SearchCriteriaResponse {
  [key: string]: string[] | { min: number | string; max: number | string } | undefined
}

export interface FilterValue {
  [key: string]: any
}

interface SearchFilterProps {
  /** The API endpoint to fetch search criteria from */
  criteriaEndpoint: string
  /** The API endpoint to get filter counts from */
  filterEndpoint?: string
  /** Current filter values */
  value?: FilterValue
  /** Callback when filter values change */
  onValueChange?: (value: FilterValue) => void
  /** Custom title for the filter card */
  title?: string
  /** Custom field labels */
  fieldLabels?: Record<string, string>
  /** Custom CSS classes */
  className?: string
  /** Show filter count */
  showCount?: boolean
}

export function SearchFilter({
  criteriaEndpoint,
  filterEndpoint,
  value = {},
  onValueChange,
  title = "Search Filters",
  fieldLabels = {},
  className,
  showCount = false
}: SearchFilterProps) {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteriaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCount, setFilterCount] = useState<number | null>(null)
  const [countLoading, setCountLoading] = useState(false)

  useEffect(() => {
    fetchSearchCriteria()
  }, [criteriaEndpoint])

  useEffect(() => {
    if (showCount && filterEndpoint && Object.keys(value).length > 0) {
      // Debounce the filter count API call
      const debounceTimer = setTimeout(() => {
        fetchFilterCount()
      }, 500) // 500ms delay

      return () => clearTimeout(debounceTimer)
    } else {
      setFilterCount(null)
    }
  }, [value, showCount, filterEndpoint])

  const fetchSearchCriteria = async () => {
    try {
      setLoading(true)
      const criteria = await apiHelpers.get<SearchCriteriaResponse>(criteriaEndpoint, { 
        requiresAuth: true 
      })
      setSearchCriteria(criteria)
    } catch (err) {
      setError("Failed to load search criteria")
      console.error("Failed to fetch search criteria:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterCount = async () => {
    if (!filterEndpoint) return
    
    try {
      setCountLoading(true)
      const filterParams = transformFilterToQueryParams(value)
      const response = await apiHelpers.get<{ meta: { total: number } }>(filterEndpoint, {
        requiresAuth: true,
        params: { ...filterParams, per_page: 1 }
      })
      setFilterCount(response.meta.total)
    } catch (err) {
      console.error("Failed to fetch filter count:", err)
      setFilterCount(null)
    } finally {
      setCountLoading(false)
    }
  }

  const transformFilterToQueryParams = (filter: FilterValue): Record<string, any> => {
    const params: Record<string, any> = {}
    
    Object.entries(filter).forEach(([key, filterValue]) => {
      // Skip null, undefined, or empty values
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return
      }
      
      // Skip empty arrays
      if (Array.isArray(filterValue) && filterValue.length === 0) {
        return
      }
      
      // Skip mode tracking fields
      if (key.endsWith('_mode')) {
        return
      }
      
      if (key.startsWith('min_')) {
        const fieldName = key.replace('min_', '')
        params[`min_${fieldName}`] = filterValue
      } else if (key.startsWith('max_')) {
        const fieldName = key.replace('max_', '')
        params[`max_${fieldName}`] = filterValue
      } else if (Array.isArray(filterValue)) {
        // For arrays, add each value with _in[] suffix
        filterValue.forEach(val => {
          const paramKey = `${key}_in[]`
          if (!params[paramKey]) params[paramKey] = []
          params[paramKey].push(val)
        })
      } else {
        params[key] = filterValue
      }
    })
    
    return params
  }

  const updateFilter = (key: string, filterValue: any) => {
    const newValue = { ...value, [key]: filterValue }
    
    // Remove null/undefined values to keep the filter clean
    Object.keys(newValue).forEach(k => {
      if (newValue[k] === null || newValue[k] === undefined || 
          (Array.isArray(newValue[k]) && newValue[k].length === 0)) {
        delete newValue[k]
      }
    })
    
    onValueChange?.(newValue)
  }

  const getFieldLabel = (key: string): string => {
    if (fieldLabels[key]) return fieldLabels[key]
    
    const defaultLabels: Record<string, string> = {
      age: "Age",
      height: "Height (cm)",
      weight: "Weight (kg)",
      birth_date: "Birth Date",
      source: "Source",
      gender: "Gender",
      blood_group: "Blood Group",
      eye_color: "Eye Color",
      hair_color: "Hair Color",
      "address.city": "City",
      "address.state": "State",
      "address.country": "Country",
      "address.plz": "Postal Code",
      "address.latitude": "Latitude",
      "address.longitude": "Longitude",
    }
    
    return defaultLabels[key] || key.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const isDateField = (key: string): boolean => {
    return key.includes('date') || key.includes('Date')
  }

  const renderRangeField = (key: string, range: { min: number; max: number }) => {
    const minKey = `min_${key}`
    const maxKey = `max_${key}`
    const exactKey = key
    const modeKey = `${key}_mode` // Track the selected mode
    
    // Check if we're in exact mode or have exact values
    const isExactMode = value[modeKey] === 'exact' || (value[exactKey] !== undefined && value[minKey] === undefined && value[maxKey] === undefined)
    const currentMin = value[minKey] ?? range.min
    const currentMax = value[maxKey] ?? range.max
    const exactValue = value[exactKey] || ''

    return (
      <div key={key} className="space-y-3">
        <h4 className="text-sm font-medium">{getFieldLabel(key)}</h4>
        
        {/* Toggle between exact and range */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`${key}-mode`}
              checked={!isExactMode}
              onChange={() => {
                const newValue = { ...value }
                delete newValue[exactKey]
                delete newValue[modeKey]
                onValueChange?.(newValue)
              }}
            />
            <span className="text-sm">Range</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`${key}-mode`}
              checked={isExactMode}
              onChange={() => {
                const newValue = { ...value }
                delete newValue[minKey]
                delete newValue[maxKey]
                // Set mode to exact but don't set a default value
                newValue[modeKey] = 'exact'
                onValueChange?.(newValue)
              }}
            />
            <span className="text-sm">Exact value</span>
          </label>
        </div>

        {isExactMode ? (
          <input
            type="number"
            value={exactValue}
            onChange={(e) => updateFilter(exactKey, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={`Enter exact ${getFieldLabel(key).toLowerCase()}`}
            min={range.min}
            max={range.max}
            step={key === 'age' ? 1 : (key === 'address.latitude' || key === 'address.longitude') ? 0.000001 : 0.01}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        ) : (
          <div>
            <RangeSlider
              label=""
              min={range.min}
              max={range.max}
              value={[currentMin, currentMax]}
              onValueChange={([min, max]) => {
                // Update both values at once to prevent race conditions
                const newValue = { ...value }
                if (min === range.min) {
                  delete newValue[minKey]
                } else {
                  newValue[minKey] = min
                }
                if (max === range.max) {
                  delete newValue[maxKey]
                } else {
                  newValue[maxKey] = max
                }
                onValueChange?.(newValue)
              }}
              step={key === 'age' ? 1 : (key === 'address.latitude' || key === 'address.longitude') ? 0.000001 : 0.01}
            />
          </div>
        )}
      </div>
    )
  }

  const renderDateRangeField = (key: string, range: { min: string; max: string }) => {
    const minKey = `min_${key.replace('.', '_')}`
    const maxKey = `max_${key.replace('.', '_')}`

    return (
      <div key={key} className="space-y-2">
        <h4 className="text-sm font-medium">{getFieldLabel(key)}</h4>
        <div className="grid grid-cols-2 gap-2">
          <DatePicker
            label="From"
            value={value[minKey] || ''}
            onChange={(date) => updateFilter(minKey, date || undefined)}
            placeholder="Select start date"
          />
          <DatePicker
            label="To"
            value={value[maxKey] || ''}
            onChange={(date) => updateFilter(maxKey, date || undefined)}
            placeholder="Select end date"
          />
        </div>
      </div>
    )
  }

  const renderStringRangeField = (key: string, range: { min: string; max: string }) => {
    const minKey = `min_${key.replace('.', '_')}`
    const maxKey = `max_${key.replace('.', '_')}`

    return (
      <div key={key} className="space-y-2">
        <h4 className="text-sm font-medium">{getFieldLabel(key)}</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder={`Min (${range.min})`}
            value={value[minKey] || ''}
            onChange={(e) => updateFilter(minKey, e.target.value || undefined)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder={`Max (${range.max})`}
            value={value[maxKey] || ''}
            onChange={(e) => updateFilter(maxKey, e.target.value || undefined)}
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>
    )
  }

  const renderArrayField = (key: string, options: string[]) => {
    const selectOptions = options.map(option => ({
      value: option,
      label: option.charAt(0).toUpperCase() + option.slice(1)
    }))

    // All fields are multi-select and nullable
    const currentValue = value[key]
    let selectedValues: string[] = []
    
    if (Array.isArray(currentValue)) {
      selectedValues = currentValue
    } else if (typeof currentValue === 'string') {
      selectedValues = [currentValue]
    }

    return (
      <div key={key} className="space-y-2">
        <h4 className="text-sm font-medium">{getFieldLabel(key)}</h4>
        <MultiSelect
          options={selectOptions}
          value={selectedValues}
          onValueChange={(selectedValues) => {
            if (selectedValues.length === 0) {
              // Nullable - no filter applied
              updateFilter(key, undefined)
            } else if (selectedValues.length === 1) {
              // Store as string for exact match when only one value
              updateFilter(key, selectedValues[0])
            } else {
              // Store as array when multiple values
              updateFilter(key, selectedValues)
            }
          }}
          placeholder={`Select ${getFieldLabel(key).toLowerCase()}`}
          maxDisplay={2}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error || !searchCriteria) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          {error || "No search criteria available"}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showCount && (
            <div className="flex items-center gap-2">
              {countLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : filterCount !== null ? (
                <Badge variant="secondary">
                  {filterCount} matches
                </Badge>
              ) : null}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Render fields based on criteria type */}
        {Object.entries(searchCriteria).map(([key, criteria]) => {
          if (typeof criteria === 'object' && criteria && 'min' in criteria && 'max' in criteria) {
            if (typeof criteria.min === 'number' && typeof criteria.max === 'number') {
              return renderRangeField(key, criteria as { min: number; max: number })
            } else if (typeof criteria.min === 'string' && typeof criteria.max === 'string') {
              if (isDateField(key)) {
                return renderDateRangeField(key, criteria as { min: string; max: string })
              } else {
                return renderStringRangeField(key, criteria as { min: string; max: string })
              }
            }
          }
          
          // Render array fields (options)
          if (Array.isArray(criteria)) {
            return renderArrayField(key, criteria)
          }
          
          return null
        })}
      </CardContent>
    </Card>
  )
}