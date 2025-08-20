import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { DatePicker } from "~/components/ui/date-picker"
import { Combobox } from "~/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { FormLayout } from "~/components/ui/form-layout"
import { FormField } from "~/components/ui/form-field"
import { FormActions } from "~/components/ui/form-actions"

import { apiHelpers } from "~/lib/api"
import { ProspectFilter } from "~/components/prospect-filter"
import type { ProspectFilter as ProspectFilterType } from "~/services/prospects"
import { transformProspectFilterForAPI, transformProspectFilterFromAPI } from "~/utils/prospect-filter"
import { useFormWithValidation } from "~/hooks/useFormWithValidation"

type Campaign = {
  id?: string
  title: string
  description: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  slug: string
  landingpage_id: string | null
  prospect_filter?: ProspectFilterType
}

type Landingpage = {
  id: string
  title: string
}


export default function CampaignForm() {
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
  } = useFormWithValidation<Campaign>({
    initialData: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      slug: '',
      landingpage_id: null,
      prospect_filter: {}
    },
    endpoint: '/api/campaigns',
    redirectPath: '/admin/campaign',
    onSuccess: () => navigate('/admin/campaign')
  })

  const [landingpages, setLandingpages] = useState<Landingpage[]>([])
  const [fetchingData, setFetchingData] = useState(isEditing)
  const [fetchingLandingpages, setFetchingLandingpages] = useState(true)

  useEffect(() => {
    const initializeData = async () => {
      await fetchLandingpages()
      if (isEditing && id) {
        await fetchCampaign(id)
      }
    }
    initializeData()
  }, [id, isEditing])

  const fetchLandingpages = async () => {
    try {
      setFetchingLandingpages(true)
      const response = await apiHelpers.paginated(
        "/api/landingpages",
        { page: 1, per_page: 100 },
        { requiresAuth: true }
      )
      setLandingpages(response.data)
    } catch (error) {
      console.error('Failed to fetch landing pages:', error)
    } finally {
      setFetchingLandingpages(false)
    }
  }

  const fetchCampaign = async (campaignId: string) => {
    try {
      setFetchingData(true)
      const response = await apiHelpers.get(`/api/campaigns/${campaignId}`, { requiresAuth: true })
      const campaign = response.data
      updateFormData({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
        end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
        status: campaign.status.toLowerCase(),
        slug: campaign.slug || '',
        landingpage_id: campaign.landingpage?.id || null,
        prospect_filter: campaign.prospect_filter ? transformProspectFilterFromAPI(campaign.prospect_filter) : {}
      })
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      navigate('/admin/campaign')
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      start_date: formData.start_date ? `${formData.start_date}T00:00:00.000Z` : null,
      end_date: formData.end_date ? `${formData.end_date}T23:59:59.000Z` : null,
      prospect_filter: formData.prospect_filter && Object.keys(formData.prospect_filter).length > 0 
        ? transformProspectFilterForAPI(formData.prospect_filter)
        : undefined
    }

    await submitForm(submitData, { isEditing, id })
  }


  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleBlur = () => {
    if (formData.title && !formData.slug) {
      const generatedSlug = generateSlug(formData.title)
      updateFormData({ slug: generatedSlug })
    }
  }

  return (
    <FormLayout
      title={isEditing ? 'Edit Campaign' : 'Create New Campaign'}
      description={isEditing ? 'Update the campaign details below.' : 'Create a new campaign by filling out the form below.'}
      backPath="/admin/campaign"
      isLoading={fetchingData || fetchingLandingpages}
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
                onBlur={handleTitleBlur}
                className={getFieldError('title') ? 'border-red-500' : ''}
                placeholder="Enter campaign title"
              />
            </FormField>

            <FormField
              label="Slug"
              htmlFor="slug"
              error={getFieldError('slug')}
            >
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => updateFormData({ slug: e.target.value })}
                className={getFieldError('slug') ? 'border-red-500' : ''}
                placeholder="Enter URL slug (e.g., my-campaign)"
              />
            </FormField>

            <FormField
              label="Landing Page"
              htmlFor="landingpage_id"
              error={getFieldError('landingpage_id')}
            >
              <Combobox
                options={[
                  { value: "", label: "No Landing Page" },
                  ...landingpages.map((landingpage) => ({
                    value: landingpage.id,
                    label: landingpage.title,
                  }))
                ]}
                value={formData.landingpage_id || ""}
                onValueChange={(value) => updateFormData({ landingpage_id: value || null })}
                placeholder="Select a landing page"
                emptyMessage="No landing pages found."
                className={getFieldError('landingpage_id') ? 'border-red-500' : ''}
                disabled={fetchingLandingpages}
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="description"
              error={getFieldError('description')}
            >
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className={getFieldError('description') ? 'border-red-500' : ''}
                placeholder="Enter campaign description"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Start Date"
                htmlFor="start_date"
                error={getFieldError('start_date')}
              >
                <DatePicker
                  label=""
                  value={formData.start_date}
                  onChange={(date) => updateFormData({ start_date: date })}
                  placeholder="Select start date"
                  error={!!getFieldError('start_date')}
                />
              </FormField>
              <FormField
                label="End Date"
                htmlFor="end_date"
                error={getFieldError('end_date')}
              >
                <DatePicker
                  label=""
                  value={formData.end_date}
                  onChange={(date) => updateFormData({ end_date: date })}
                  placeholder="Select end date"
                  error={!!getFieldError('end_date')}
                />
              </FormField>
            </div>

            <FormField
              label="Status"
              htmlFor="status"
              error={getFieldError('status')}
            >
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'active' | 'paused' | 'completed') =>
                  updateFormData({ status: value })
                }
              >
                <SelectTrigger className={`w-full ${getFieldError('status') ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="space-y-2">
              <ProspectFilter
                value={formData.prospect_filter}
                onValueChange={(filter) => updateFormData({ prospect_filter: filter })}
              />
            </div>
            
            <FormActions
              isEditing={isEditing}
              isLoading={loading}
              onCancel={() => navigate('/admin/campaign')}
            />
          </form>
    </FormLayout>
  )
}