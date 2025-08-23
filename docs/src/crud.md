# CRUD Implementation Guide
## CRUD Operations Summary

### Campaigns

- **List (Read All):**
  - File: `app/routes/admin/campaign.tsx`
  - Uses `clientLoader` for paginated fetch from `/api/campaigns` with smart caching (`CACHE_TAGS.CAMPAIGNS`).
  - UI: `AdminListLayout` with edit/delete actions via `useAdminActions`.
- **Create:**
  - File: `app/routes/admin/campaign-form.tsx`
  - Uses `useFormWithValidation` with endpoint `/api/campaigns`. Fields: title, slug (auto), description, dates, status, landing page, prospect filter.
  - On submit, calls `submitForm`, redirects, and invalidates cache.
- **Read (Single):**
  - File: `app/routes/admin/campaign-form.tsx`
  - On edit, fetches campaign by ID from `/api/campaigns/:id` and populates form.
- **Update:**
  - File: `app/routes/admin/campaign-form.tsx`
  - If editing, submits to `/api/campaigns/:id` (via `submitForm` with `isEditing`). Updates cache and redirects.
- **Delete:**
  - File: `app/routes/admin/campaign.tsx`
  - Uses `useAdminActions` to delete via `/api/campaigns/:id`. Confirmation dialog, cache update, toast notification.

### Landing Pages

- **List (Read All):**
  - File: `app/routes/admin/landingpage.tsx`
  - Uses `clientLoader` for paginated fetch from `/api/landingpages` with smart caching (`CACHE_TAGS.LANDINGPAGES`).
  - UI: `AdminListLayout` with edit/delete actions via `useAdminActions`.
- **Create:**
  - File: `app/routes/admin/landingpage-form.tsx`
  - Uses `useFormWithValidation` with endpoint `/api/landingpages`. Fields: title, headline, subline, repeatable sections.
  - On submit, calls `submitForm`, redirects, and invalidates cache.
- **Read (Single):**
  - File: `app/routes/admin/landingpage-form.tsx`
  - On edit, fetches landing page by ID from `/api/landingpages/:id` and populates form.
- **Update:**
  - File: `app/routes/admin/landingpage-form.tsx`
  - If editing, submits to `/api/landingpages/:id` (via `submitForm` with `isEditing`). Updates cache and redirects.
- **Delete:**
  - File: `app/routes/admin/landingpage.tsx`
  - Uses `useAdminActions` to delete via `/api/landingpages/:id`. Confirmation dialog, cache update, toast notification.

### Prospects

- **List (Read All):**
  - File: `app/routes/admin/prospects.tsx`
  - Uses `clientLoader` for paginated fetch from `/api/prospects` with smart caching (`CACHE_TAGS.PROSPECTS`).
  - UI: `AdminViewLayout` in read-only mode.
- **Read (Single):**
  - Not explicitly shown, but individual prospect data is available via the paginated list.
- **Create / Update / Delete:**
  - Not available. Prospects are read-only entities; no create, edit, or delete actions are exposed in the UI or API.

### Shared Features

- Smart caching (2-min TTL, tag-based invalidation)
- Form validation (`useFormWithValidation`)
- Optimistic UI (toast notifications, loading states)
- Type safety (TypeScript interfaces)
- Error handling (network, validation, boundaries)

This guide documents the complete CRUD (Create, Read, Update, Delete) implementation patterns used in the APDE application for Campaigns, Landing Pages, and Prospects.

## Architecture Overview

The application uses a modern React Router v7 pattern with:
- **Route-based data loading** with `clientLoader` functions
- **Form handling** with `useFormWithValidation` hook  
- **Admin actions** with `useAdminActions` hook
- **Smart caching** with automatic invalidation
- **Type-safe API calls** with full TypeScript support
- **Optimistic UI updates** with toast notifications

## Common Patterns

### 1. List View Pattern

All entity list views follow this pattern:

```typescript
// app/routes/admin/[entity].tsx
import { useLoaderData } from "react-router";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminActions } from "~/hooks/useAdminActions";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Entity>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Entity>>(
      '/api/entities',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.ENTITIES,
    { ttl: 2 * 60 * 1000 } // 2 minutes TTL
  );
}

export default function EntityList() {
  const entities = useLoaderData<typeof clientLoader>();
  
  const adminActions = useAdminActions({
    endpoint: '/api/entities',
    basePath: '/admin/entity',
    cacheKey: CACHE_TAGS.ENTITIES,
    entityName: 'Entity'
  });

  return (
    <AdminListLayout
      title="Entities"
      createButtonText="Create Entity"
      data={entities}
      columns={entityColumns(adminActions.handleEdit, adminActions.handleDelete)}
      {...adminActions}
    />
  );
}
```

### 2. Form Pattern

All entity forms follow this pattern:

```typescript
// app/routes/admin/[entity]-form.tsx
import { useNavigate, useParams } from "react-router"
import { useFormWithValidation } from "~/hooks/useFormWithValidation"
import { FormLayout } from "~/components/ui/form-layout"
import { CACHE_TAGS } from "~/lib/cache-manager"

export default function EntityForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const { formData, updateFormData, loading, getFieldError, submitForm } = 
    useFormWithValidation<EntityType>({
      initialData: { /* default values */ },
      endpoint: '/api/entities',
      redirectPath: '/admin/entity',
      cacheKey: CACHE_TAGS.ENTITIES,
      onSuccess: () => navigate('/admin/entity'),
      entityName: 'Entity'
    })

  // Data fetching for edit mode
  useEffect(() => {
    if (isEditing && id) {
      fetchEntity(id)
    }
  }, [id, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(formData, { isEditing, id })
  }

  return (
    <FormLayout title={isEditing ? 'Edit Entity' : 'Create Entity'}>
      <form onSubmit={handleSubmit}>
        {/* Form fields with validation */}
      </form>
    </FormLayout>
  )
}
```

---

## Campaign CRUD Implementation

Campaigns represent marketing campaigns with landing pages and prospect filtering.

### Campaign Data Structure

```typescript
interface Campaign {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  slug: string;
  landingpage_id: string | null;
  landingpage?: {
    id: string;
    title: string;
  } | null;
  prospect_filter?: ProspectFilter;
}
```

### Campaign List View

**File:** `app/routes/admin/campaign.tsx`

```typescript
import { useLoaderData } from "react-router";
import type { Campaign, PaginatedResponse } from "~/lib/types";
import { campaignColumns } from "~/components/columns/campaign-columns";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminActions } from "~/hooks/useAdminActions";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Campaign>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Campaign>>(
      '/api/campaigns',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.CAMPAIGNS,
    { ttl: 2 * 60 * 1000 }
  );
}

export default function Campaign() {
  const campaigns = useLoaderData<typeof clientLoader>();
  
  const {
    deleteOpen,
    setDeleteOpen,
    itemToDelete,
    isDeleting,
    handleEdit,
    handleDelete,
    handleCreate,
    handleDeleteConfirm
  } = useAdminActions({
    endpoint: '/api/campaigns',
    basePath: '/admin/campaign',
    cacheKey: CACHE_TAGS.CAMPAIGNS,
    entityName: 'Campaign'
  });

  const columns = campaignColumns(handleEdit, handleDelete);

  return (
    <AdminListLayout
      title="Campaigns"
      createButtonText="Create Campaign"
      entityType="Campaign"
      endpoint="/api/campaigns"
      data={campaigns}
      columns={columns}
      deleteOpen={deleteOpen}
      setDeleteOpen={setDeleteOpen}
      itemToDelete={itemToDelete}
      isDeleting={isDeleting}
      onCreate={handleCreate}
      onDeleteConfirm={handleDeleteConfirm}
    />
  );
}
```

### Campaign Form

**File:** `app/routes/admin/campaign-form.tsx`

```typescript
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { DatePicker } from "~/components/ui/date-picker"
import { Combobox } from "~/components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { FormLayout } from "~/components/ui/form-layout"
import { FormField } from "~/components/ui/form-field"
import { FormActions } from "~/components/ui/form-actions"
import { ProspectFilter } from "~/components/prospect-filter"
import { useFormWithValidation } from "~/hooks/useFormWithValidation"
import { CACHE_TAGS } from "~/lib/cache-manager"
import { apiHelpers } from "~/lib/api"

type Campaign = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  slug: string;
  landingpage_id: string | null;
  prospect_filter?: ProspectFilter;
}

export default function CampaignForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const { formData, updateFormData, loading, getFieldError, submitForm } = 
    useFormWithValidation<Campaign>({
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
      cacheKey: CACHE_TAGS.CAMPAIGNS,
      onSuccess: () => navigate('/admin/campaign'),
      entityName: 'Campaign'
    })

  const [landingpages, setLandingpages] = useState([])
  const [fetchingData, setFetchingData] = useState(isEditing)
  const [fetchingLandingpages, setFetchingLandingpages] = useState(true)

  // Fetch related data on mount
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
        { page: 1, per_page: 50 },
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
        title: campaign.title,
        description: campaign.description,
        start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
        end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
        status: campaign.status.toLowerCase(),
        slug: campaign.slug || '',
        landingpage_id: campaign.landingpage?.id || null,
        prospect_filter: campaign.prospect_filter || {}
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
        ? formData.prospect_filter
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
        <FormField label="Title" htmlFor="title" error={getFieldError('title')}>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            onBlur={handleTitleBlur}
            className={getFieldError('title') ? 'border-red-500' : ''}
            placeholder="Enter campaign title"
          />
        </FormField>

        <FormField label="Slug" htmlFor="slug" error={getFieldError('slug')}>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => updateFormData({ slug: e.target.value })}
            className={getFieldError('slug') ? 'border-red-500' : ''}
            placeholder="Enter URL slug (e.g., my-campaign)"
          />
        </FormField>

        <FormField label="Landing Page" htmlFor="landingpage_id" error={getFieldError('landingpage_id')}>
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
            disabled={fetchingLandingpages}
          />
        </FormField>

        <FormField label="Description" htmlFor="description" error={getFieldError('description')}>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={4}
            placeholder="Enter campaign description"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" htmlFor="start_date" error={getFieldError('start_date')}>
            <DatePicker
              value={formData.start_date}
              onChange={(date) => updateFormData({ start_date: date })}
              placeholder="Select start date"
              error={!!getFieldError('start_date')}
            />
          </FormField>
          <FormField label="End Date" htmlFor="end_date" error={getFieldError('end_date')}>
            <DatePicker
              value={formData.end_date}
              onChange={(date) => updateFormData({ end_date: date })}
              placeholder="Select end date"
              error={!!getFieldError('end_date')}
            />
          </FormField>
        </div>

        <FormField label="Status" htmlFor="status" error={getFieldError('status')}>
          <Select
            value={formData.status}
            onValueChange={(value) => updateFormData({ status: value })}
          >
            <SelectTrigger>
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
```

### Campaign Features

- **Auto-slug generation** from title
- **Landing page relationship** with dropdown selection
- **Date handling** with proper timezone conversion
- **Prospect filtering** with complex filter builder
- **Status management** with predefined options
- **Validation** with field-level error display

---

## Landing Page CRUD Implementation

Landing pages are content pages with sections that can be associated with campaigns.

### Landing Page Data Structure

```typescript
interface Landingpage {
  id: string;
  title: string;
  headline: string;
  subline: string;
  sections: LandingpageSection[];
  campaigns: Campaign[]; // Related campaigns
}

interface LandingpageSection {
  text: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
}
```

### Landing Page List View

**File:** `app/routes/admin/landingpage.tsx`

```typescript
import { useLoaderData } from "react-router";
import type { Landingpage, PaginatedResponse } from "~/lib/types";
import { landingpageColumns } from "~/components/columns/landingpage-columns";
import { AdminListLayout } from "~/components/ui/admin-list-layout";
import { useAdminActions } from "~/hooks/useAdminActions";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Landingpage>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Landingpage>>(
      '/api/landingpages',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.LANDINGPAGES,
    { ttl: 2 * 60 * 1000 }
  );
}

export default function Landingpage() {
  const landingpages = useLoaderData<typeof clientLoader>();
  
  const adminActions = useAdminActions({
    endpoint: '/api/landingpages',
    basePath: '/admin/landingpage',
    cacheKey: CACHE_TAGS.LANDINGPAGES,
    entityName: 'Landing Page'
  });

  const columns = landingpageColumns(adminActions.handleEdit, adminActions.handleDelete);

  return (
    <AdminListLayout
      title="Landing Pages"
      createButtonText="Create Landing Page"
      entityType="Landing Page"
      endpoint="/api/landingpages"
      data={landingpages}
      columns={columns}
      {...adminActions}
    />
  );
}
```

### Landing Page Form

**File:** `app/routes/admin/landingpage-form.tsx`

```typescript
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { SectionsRepeater } from "~/components/ui/sections-repeater"
import { FormLayout } from "~/components/ui/form-layout"
import { FormField } from "~/components/ui/form-field"
import { FormActions } from "~/components/ui/form-actions"
import { useFormWithValidation } from "~/hooks/useFormWithValidation"
import { CACHE_TAGS } from "~/lib/cache-manager"
import { apiHelpers } from "~/lib/api"

type Landingpage = {
  title: string;
  headline: string;
  subline: string;
  sections: LandingpageSection[];
}

export default function LandingpageForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const { formData, updateFormData, loading, getFieldError, submitForm } = 
    useFormWithValidation<Landingpage>({
      initialData: {
        title: '',
        headline: '',
        subline: '',
        sections: []
      },
      endpoint: '/api/landingpages',
      redirectPath: '/admin/landingpage',
      cacheKey: CACHE_TAGS.LANDINGPAGES,
      onSuccess: () => navigate('/admin/landingpage'),
      entityName: 'Landing Page'
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
        title: landingpage.title,
        headline: landingpage.headline,
        subline: landingpage.subline,
        sections: (landingpage.sections || []).map((section) => ({
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
        <FormField label="Title" htmlFor="title" error={getFieldError('title')}>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Enter landing page title"
          />
        </FormField>

        <FormField label="Headline" htmlFor="headline" error={getFieldError('headline')}>
          <Input
            id="headline"
            value={formData.headline}
            onChange={(e) => updateFormData({ headline: e.target.value })}
            placeholder="Enter main headline"
          />
        </FormField>

        <FormField label="Subline" htmlFor="subline" error={getFieldError('subline')}>
          <Textarea
            id="subline"
            value={formData.subline}
            onChange={(e) => updateFormData({ subline: e.target.value })}
            rows={3}
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
```

### Landing Page Features

- **Section management** with repeatable section builder
- **Rich content** with text, images, and CTAs
- **Dynamic sections** add/remove functionality
- **Content validation** per section

---

## Prospect CRUD Implementation

Prospects are read-only entities representing potential customers with demographic data.

### Prospect Data Structure

```typescript
interface Prospect {
  id: string;
  gender: string;
  age: number;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hairColor: string;
  hairType: string;
  address: {
    address: string;
    city: string;
    state: string;
    plz: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}
```

### Prospect View (Read-Only)

**File:** `app/routes/admin/prospects.tsx`

```typescript
import { useLoaderData } from "react-router";
import type { Prospect, PaginatedResponse } from "~/lib/types";
import { prospectColumns } from "~/components/columns/prospect-columns";
import { AdminViewLayout } from "~/components/ui/admin-view-layout";
import { apiHelpers } from "~/lib/api";
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

export async function clientLoader(): Promise<PaginatedResponse<Prospect>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Prospect>>(
      '/api/prospects',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.PROSPECTS,
    { ttl: 2 * 60 * 1000 }
  );
}

export default function Prospects() {
  const prospects = useLoaderData<typeof clientLoader>();

  return (
    <AdminViewLayout
      title="Prospects"
      data={prospects}
      columns={prospectColumns}
      loading={false}
      error={null}
    />
  );
}
```

### Prospect Features

- **Read-only view** with no create/edit/delete actions
- **Rich demographic data** display
- **Address information** with location data
- **Filtering** and **search** capabilities through the view layout

---

## Key Features Across All CRUD Implementations

### 1. Smart Caching
- **2-minute TTL** for all data
- **Automatic invalidation** on create/update/delete
- **Tag-based** cache management
- **Route revalidation** after mutations

### 2. Error Handling
- **Field-level validation** with Laravel error parsing
- **Form submission errors** with toast notifications
- **Network error handling** with retry mechanisms
- **Route-level error boundaries**

### 3. Loading States
- **Form submission loading** with disabled buttons
- **Data fetching loading** with skeleton states
- **Optimistic updates** with immediate UI feedback

### 4. User Experience
- **Toast notifications** for all actions
- **Confirmation dialogs** for destructive actions
- **Auto-save** draft functionality where applicable
- **Keyboard shortcuts** and accessibility support

### 5. Type Safety
- **Full TypeScript** implementation
- **API response types** with proper interfaces
- **Form validation types** matching backend schemas
- **Route parameter types** with React Router v7

### 6. Performance Optimizations
- **Paginated data fetching** with auto-fetch all pages
- **Parallel API requests** for related data
- **Memoized column definitions** to prevent re-renders
- **Lazy loading** of form components

This CRUD implementation provides a robust, scalable pattern that can be extended to any new entities in the application while maintaining consistency and performance.