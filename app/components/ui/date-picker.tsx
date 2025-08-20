"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  className,
  disabled = false,
  error = false
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [inputValue, setInputValue] = React.useState(formatDate(date))

  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value)
      setDate(newDate)
      setMonth(newDate)
      setInputValue(formatDate(newDate))
    } else {
      setDate(undefined)
      setMonth(undefined)
      setInputValue("")
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setInputValue(formatDate(selectedDate))
    setOpen(false)
    
    if (selectedDate && onChange) {
      // Format date as YYYY-MM-DD for HTML date input compatibility
      const formattedDate = selectedDate.toISOString().split('T')[0]
      onChange(formattedDate)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value)
    setInputValue(e.target.value)
    
    if (isValidDate(inputDate)) {
      setDate(inputDate)
      setMonth(inputDate)
      if (onChange) {
        const formattedDate = inputDate.toISOString().split('T')[0]
        onChange(formattedDate)
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label className="px-1">
          {label}
        </Label>
      )}
      <div className="relative flex gap-2">
        <Input
          value={inputValue}
          placeholder={placeholder}
          className={cn(
            "bg-background pr-10",
            error && "border-red-500"
          )}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
          disabled={disabled}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
