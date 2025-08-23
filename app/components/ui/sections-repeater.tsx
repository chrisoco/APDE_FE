"use client"

import React from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import type { LandingpageSection } from '~/lib/types'

interface SectionsRepeaterProps {
  sections: LandingpageSection[]
  onChange: (sections: LandingpageSection[]) => void
  errors?: { [key: string]: string[] }
}

export function SectionsRepeater({ sections, onChange, errors }: SectionsRepeaterProps) {
  const addSection = () => {
    const newSection: LandingpageSection = {
      text: '',
      image_url: '',
      cta_text: '',
      cta_url: ''
    }
    onChange([...sections, newSection])
  }

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index)
    onChange(newSections)
  }

  const updateSection = (index: number, field: keyof LandingpageSection, value: string) => {
    const newSections = sections.map((section, i) => 
      i === index ? { ...section, [field]: value } : section
    )
    onChange(newSections)
  }

  const getFieldError = (sectionIndex: number, field: string) => {
    return errors?.[`sections.${sectionIndex}.${field}`]?.[0]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Sections</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSection}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No sections added yet. Click "Add Section" to get started.
        </div>
      )}

      {sections.map((section, index) => (
        <Card key={index} className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              Section {index + 1}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSection(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`section-${index}-text`}>Content (Markdown)</Label>
              <div className={getFieldError(index, 'text') ? 'border border-red-500 rounded' : ''}>
                <MDEditor
                  value={section.text}
                  onChange={(value) => updateSection(index, 'text', value || '')}
                  preview="edit"
                  hideToolbar={false}
                  data-color-mode="light"
                />
              </div>
              {getFieldError(index, 'text') && (
                <p className="text-sm text-red-600">{getFieldError(index, 'text')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`section-${index}-image_url`}>Image URL</Label>
                <Input
                  id={`section-${index}-image_url`}
                  value={section.image_url || ''}
                  onChange={(e) => updateSection(index, 'image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={getFieldError(index, 'image_url') ? 'border-red-500' : ''}
                />
                {getFieldError(index, 'image_url') && (
                  <p className="text-sm text-red-600">{getFieldError(index, 'image_url')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`section-${index}-cta_text`}>CTA Text</Label>
                <Input
                  id={`section-${index}-cta_text`}
                  value={section.cta_text || ''}
                  onChange={(e) => updateSection(index, 'cta_text', e.target.value)}
                  placeholder="Learn More"
                  className={getFieldError(index, 'cta_text') ? 'border-red-500' : ''}
                />
                {getFieldError(index, 'cta_text') && (
                  <p className="text-sm text-red-600">{getFieldError(index, 'cta_text')}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`section-${index}-cta_url`}>CTA URL</Label>
              <Input
                id={`section-${index}-cta_url`}
                value={section.cta_url || ''}
                onChange={(e) => updateSection(index, 'cta_url', e.target.value)}
                placeholder="https://example.com/action"
                className={getFieldError(index, 'cta_url') ? 'border-red-500' : ''}
              />
              {getFieldError(index, 'cta_url') && (
                <p className="text-sm text-red-600">{getFieldError(index, 'cta_url')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}