import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { DatePicker } from "~/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import { ArrowLeft, Loader2 } from "lucide-react"
import { apiHelpers } from "~/lib/api"

type Campaign = {
  id?: string
  title: string
  description: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'paused' | 'completed'
}

type ValidationErrors = {
  [key: string]: string[]
}

export default function CampaignForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState<Campaign>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(isEditing)
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (isEditing && id) {
      fetchCampaign(id)
    }
  }, [id, isEditing])

  const fetchCampaign = async (campaignId: string) => {
    try {
      setFetchingData(true)
      const response = await apiHelpers.get(`/api/campaigns/${campaignId}`, { requiresAuth: true })
      const campaign = response.data
      setFormData({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
        end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
        status: campaign.status.toLowerCase()
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
    setLoading(true)
    setErrors({})

    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? `${formData.start_date}T00:00:00.000Z` : null,
        end_date: formData.end_date ? `${formData.end_date}T23:59:59.000Z` : null,
      }

      if (isEditing && id) {
        await apiHelpers.put(`/api/campaigns/${id}`, submitData, { requiresAuth: true, includeCSRF: true })
      } else {
        await apiHelpers.post('/api/campaigns', submitData, { requiresAuth: true, includeCSRF: true })
      }

      navigate('/admin/campaign')
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

  if (fetchingData) {
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
          onClick={() => navigate('/admin/campaign')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Campaign Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing 
              ? 'Update the campaign details below.' 
              : 'Create a new campaign by filling out the form below.'
            }
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={getFieldError('title') ? 'border-red-500' : ''}
                placeholder="Enter campaign title"
              />
              {getFieldError('title') && (
                <p className="text-sm text-red-600">{getFieldError('title')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={getFieldError('description') ? 'border-red-500' : ''}
                placeholder="Enter campaign description"
              />
              {getFieldError('description') && (
                <p className="text-sm text-red-600">{getFieldError('description')}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date })}
                  placeholder="Select start date"
                  error={!!getFieldError('start_date')}
                />
                {getFieldError('start_date') && (
                  <p className="text-sm text-red-600">{getFieldError('start_date')}</p>
                )}
              </div>
              <div className="space-y-2">
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date })}
                  placeholder="Select end date"
                  error={!!getFieldError('end_date')}
                />
                {getFieldError('end_date') && (
                  <p className="text-sm text-red-600">{getFieldError('end_date')}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'active' | 'paused' | 'completed') =>
                  setFormData({ ...formData, status: value })
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
              {getFieldError('status') && (
                <p className="text-sm text-red-600">{getFieldError('status')}</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/campaign')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Campaign' : 'Create Campaign')
                }
              </Button>
            </div>
          </form>
        </div>
    </div>
  )
}