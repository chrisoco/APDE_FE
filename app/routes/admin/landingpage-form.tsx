import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { SectionsRepeater } from "~/components/ui/sections-repeater"
import { FormLayout } from "~/components/ui/form-layout"
import { FormField } from "~/components/ui/form-field"
import { FormActions } from "~/components/ui/form-actions"

import { apiHelpers } from "~/lib/api"
import { useFormWithValidation } from "~/hooks/useFormWithValidation"

type LandingpageSection = {
  text: string
  image_url: string
  cta_text: string
  cta_url: string
}

type Landingpage = {
  id?: string
  title: string
  headline: string
  subline: string
  sections: LandingpageSection[]
}



export default function LandingpageForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const {
    formData,
    updateFormData,
    errors,
    loading,
    getFieldError,
    submitForm
  } = useFormWithValidation<Landingpage>({
    initialData: {
      title: '',
      headline: '',
      subline: '',
      sections: []
    },
    endpoint: '/api/landingpages',
    redirectPath: '/admin/landingpage',
    onSuccess: () => navigate('/admin/landingpage')
  })

  const [fetchingData, setFetchingData] = useState(isEditing)

  useEffect(() => {
    if (isEditing && id) {
      fetchLandingpage(id)
    }
  }, [id, isEditing])


  const fetchLandingpage = async (landingpageId: string) => {
    try {
      setFetchingData(true)
      const response = await apiHelpers.get(`/api/landingpages/${landingpageId}`, { requiresAuth: true })
      const landingpage = response.data
      updateFormData({
        id: landingpage.id,
        title: landingpage.title,
        headline: landingpage.headline,
        subline: landingpage.subline,
        sections: (landingpage.sections || []).map(section => ({
          text: section.text || '',
          image_url: section.image_url || '',
          cta_text: section.cta_text || '',
          cta_url: section.cta_url || ''
        }))
      })
    } catch (error) {
      console.error('Failed to fetch landing page:', error)
      navigate('/admin/landingpage')
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(formData, { isEditing, id })
  }


  return (
    <FormLayout
      title={isEditing ? 'Edit Landing Page' : 'Create New Landing Page'}
      description={isEditing ? 'Update the landing page details below.' : 'Create a new landing page by filling out the form below.'}
      backPath="/admin/landingpage"
      isLoading={fetchingData}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Title"
              htmlFor="title"
              error={getFieldError('title')}
            >
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className={getFieldError('title') ? 'border-red-500' : ''}
                placeholder="Enter landing page title"
              />
            </FormField>

            <FormField
              label="Headline"
              htmlFor="headline"
              error={getFieldError('headline')}
            >
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => updateFormData({ headline: e.target.value })}
                className={getFieldError('headline') ? 'border-red-500' : ''}
                placeholder="Enter main headline"
              />
            </FormField>


            <FormField
              label="Subline"
              htmlFor="subline"
              error={getFieldError('subline')}
            >
              <Textarea
                id="subline"
                value={formData.subline}
                onChange={(e) => updateFormData({ subline: e.target.value })}
                rows={3}
                className={getFieldError('subline') ? 'border-red-500' : ''}
                placeholder="Enter subline or description"
              />
            </FormField>

            <SectionsRepeater
              sections={formData.sections}
              onChange={(sections) => updateFormData({ sections })}
              errors={errors}
            />
            
            <FormActions
              isEditing={isEditing}
              isLoading={loading}
              onCancel={() => navigate('/admin/landingpage')}
            />
          </form>
    </FormLayout>
  )
}