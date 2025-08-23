"use client"

import * as React from "react"
import { Slider } from "~/components/ui/slider"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

interface RangeSliderProps {
  label: string
  min: number
  max: number
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  step?: number
  disabled?: boolean
  className?: string
}

export function RangeSlider({
  label,
  min,
  max,
  value = [min, max],
  onValueChange,
  step = 1,
  disabled = false,
  className,
}: RangeSliderProps) {
  // Ensure we always have exactly 2 values
  const normalizedValue: [number, number] = [
    value[0] ?? min,
    value[1] ?? max
  ]
  const [localValue, setLocalValue] = React.useState<[number, number]>(normalizedValue)

  React.useEffect(() => {
    setLocalValue(normalizedValue)
  }, [normalizedValue[0], normalizedValue[1]])

  const handleSliderChange = (newValue: number[]) => {
    // Ensure we always have exactly 2 values for the range
    const rangeValue: [number, number] = [
      newValue[0] ?? localValue[0] ?? min, 
      newValue[1] ?? localValue[1] ?? max
    ]
    setLocalValue(rangeValue)
    onValueChange?.(rangeValue)
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(min, Math.min(Number(e.target.value), localValue[1]))
    const newValue: [number, number] = [newMin, localValue[1]]
    setLocalValue(newValue)
    onValueChange?.(newValue)
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.min(max, Math.max(Number(e.target.value), localValue[0]))
    const newValue: [number, number] = [localValue[0], newMax]
    setLocalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-2 space-y-4">
        <Slider
          defaultValue={[min, max]}
          value={localValue}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full"
          minStepsBetweenThumbs={1}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`${label}-min`} className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id={`${label}-min`}
              type="number"
              value={localValue[0]}
              onChange={handleMinInputChange}
              min={min}
              max={localValue[1]}
              step={step}
              disabled={disabled}
              className="text-sm"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`${label}-max`} className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id={`${label}-max`}
              type="number"
              value={localValue[1]}
              onChange={handleMaxInputChange}
              min={localValue[0]}
              max={max}
              step={step}
              disabled={disabled}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}