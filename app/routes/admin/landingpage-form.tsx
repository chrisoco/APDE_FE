import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Combobox } from "~/components/ui/combobox"
import { SectionsRepeater } from "~/components/ui/sections-repeater"

import { ArrowLeft, Loader2 } from "lucide-react"
import { apiHelpers } from "~/lib/api"

type LandingpageSection = {
  text: string
  image_url: string
  cta_text: string
  cta_url: string
}

type Landingpage = {
  id?: string
  campaign_id: string | null
  title: string
  slug: string
  headline: string
  subline: string
  sections: LandingpageSection[]
}

type Campaign = {
  id: string
  title: string
}

type ValidationErrors = {
  [key: string]: string[]
}

export default function LandingpageForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState<Landingpage>({
    campaign_id: null,
    title: '',
    slug: '',
    headline: '',
    subline: '',
    sections: []
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(isEditing)
  const [fetchingCampaigns, setFetchingCampaigns] = useState(true)
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    fetchCampaigns()
    if (isEditing && id) {
      fetchLandingpage(id)
    }
  }, [id, isEditing])

  const fetchCampaigns = async () => {
    try {
      setFetchingCampaigns(true)
      const response = await apiHelpers.paginated(
        "/api/campaigns",
        { page: 1, per_page: 100 },
        { requiresAuth: true }
      )
      setCampaigns(response.data)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setFetchingCampaigns(false)
    }
  }

  const fetchLandingpage = async (landingpageId: string) => {
    try {
      setFetchingData(true)
      const response = await apiHelpers.get(`/api/landingpages/${landingpageId}`, { requiresAuth: true })
      const landingpage = response.data
      setFormData({
        id: landingpage.id,
        campaign_id: landingpage.campaign?.id || null,
        title: landingpage.title,
        slug: landingpage.slug,
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
    setLoading(true)
    setErrors({})

    try {
      if (isEditing && id) {
        await apiHelpers.put(`/api/landingpages/${id}`, formData, { requiresAuth: true, includeCSRF: true })
      } else {
        await apiHelpers.post('/api/landingpages', formData, { requiresAuth: true, includeCSRF: true })
      }

      navigate('/admin/landingpage')
    } catch (error: any) {
      if (error.message.includes('API Error:')) {
        try {
          const errorMessage = error.message.split('API Error: ')[1]
          const errorData = JSON.parse(errorMessage.split(' Status: ')[0])
          if (errorData.errors) {
            setErrors(errorData.errors)
          }
        } catch {
          console.error('Failed to parse error:', error)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (field: string) => {
    return errors[field]?.[0]
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  const handleTitleBlur = () => {
    if (formData.title && !formData.slug) {
      const generatedSlug = generateSlug(formData.title)
      setFormData({ ...formData, slug: generatedSlug })
    }
  }

  if (fetchingData || fetchingCampaigns) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/landingpage')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landing Pages
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Landing Page' : 'Create New Landing Page'}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Landing Page Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing 
              ? 'Update the landing page details below.' 
              : 'Create a new landing page by filling out the form below.'
            }
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign</Label>
              <Combobox
                options={[
                  { value: "", label: "No Campaign" },
                  ...campaigns.map((campaign) => ({
                    value: campaign.id,
                    label: campaign.title,
                  }))
                ]}
                value={formData.campaign_id || ""}
                onValueChange={(value) => setFormData({ ...formData, campaign_id: value || null })}
                placeholder="Select a campaign"
                emptyMessage="No campaigns found."
                className={getFieldError('campaign_id') ? 'border-red-500' : ''}
                disabled={fetchingCampaigns}
              />
              {getFieldError('campaign_id') && (
                <p className="text-sm text-red-600">{getFieldError('campaign_id')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={handleTitleBlur}
                className={getFieldError('title') ? 'border-red-500' : ''}
                placeholder="Enter landing page title"
              />
              {getFieldError('title') && (
                <p className="text-sm text-red-600">{getFieldError('title')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className={getFieldError('slug') ? 'border-red-500' : ''}
                placeholder="Enter URL slug (e.g., my-landing-page)"
              />
              {getFieldError('slug') && (
                <p className="text-sm text-red-600">{getFieldError('slug')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className={getFieldError('headline') ? 'border-red-500' : ''}
                placeholder="Enter main headline"
              />
              {getFieldError('headline') && (
                <p className="text-sm text-red-600">{getFieldError('headline')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subline">Subline</Label>
              <Textarea
                id="subline"
                value={formData.subline}
                onChange={(e) => setFormData({ ...formData, subline: e.target.value })}
                rows={3}
                className={getFieldError('subline') ? 'border-red-500' : ''}
                placeholder="Enter subline or description"
              />
              {getFieldError('subline') && (
                <p className="text-sm text-red-600">{getFieldError('subline')}</p>
              )}
            </div>

            <SectionsRepeater
              sections={formData.sections}
              onChange={(sections) => setFormData({ ...formData, sections })}
              errors={errors}
            />
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/landingpage')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Landing Page' : 'Create Landing Page')
                }
              </Button>
            </div>
          </form>
        </div>
    </div>
  )
}