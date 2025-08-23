# Cache Management System

A comprehensive client-side caching system designed for React Router v7 applications with automatic cache invalidation, TTL-based expiration, and tag-based organization.

## Overview

The cache management system provides efficient client-side data caching for API responses with intelligent invalidation patterns. It's specifically designed to work with React Router's `clientLoader` functions and supports automatic cache invalidation on CRUD operations.

### Key Features

- **In-memory client-side caching** with configurable TTL (Time To Live)
- **Automatic cache invalidation** on create, update, and delete operations
- **Tag-based organization** for logical grouping of related cache entries
- **Pattern matching** for flexible cache invalidation strategies
- **Cache statistics** for monitoring and debugging
- **Integration** with form validation hooks and admin actions

## Architecture

### Core Components

1. **CacheManager** - Main cache interface with get/set/invalidate operations
2. **withCache** - Higher-order function for wrapping API calls in clientLoaders
3. **CACHE_TAGS** - Predefined constants for consistent cache organization
4. **Automatic Invalidation** - Built into form hooks and admin actions

### Cache Storage

The system uses an in-memory `Map` for client-side storage:

```typescript
const clientCache = new Map<string, { 
  data: any; 
  timestamp: number; 
  ttl: number; 
}>()
```

Each cache entry contains:
- **data**: The cached response data
- **timestamp**: When the data was cached (milliseconds)
- **ttl**: Time to live duration (milliseconds)

## Cache Tags

Predefined constants for consistent cache organization:

```typescript
export const CACHE_TAGS = {
  CAMPAIGNS: 'campaigns',        // Campaign-related data
  PROSPECTS: 'prospects',        // Prospect/customer data  
  LANDINGPAGES: 'landingpages',  // Landing page data
  USER: 'user'                   // User profile/authentication data
} as const
```

## Usage Patterns

### Basic Caching in Route Loaders

The most common pattern uses `withCache` in React Router `clientLoader` functions:

```typescript
import { withCache, CACHE_TAGS } from "~/lib/cache-manager"
import { apiHelpers } from "~/lib/api"
import type { PaginatedResponse, Campaign } from "~/lib/types"

export async function clientLoader(): Promise<PaginatedResponse<Campaign>> {
  return withCache(
    () => apiHelpers.paginated<PaginatedResponse<Campaign>>(
      '/api/campaigns',
      { page: 1, per_page: 50 },
      { requiresAuth: true }
    ),
    CACHE_TAGS.CAMPAIGNS,
    { ttl: 2 * 60 * 1000, tags: [CACHE_TAGS.CAMPAIGNS] } // 2 minutes TTL
  )
}
```

### Custom Cache Configuration

Configure TTL and tags for different data types:

```typescript
// Short-lived data (30 seconds)
return withCache(
  () => fetchRealTimeData(),
  'realtime-stats',
  { ttl: 30 * 1000 }
)

// Long-lived data (10 minutes) 
return withCache(
  () => fetchStaticData(),
  CACHE_TAGS.USER,
  { ttl: 10 * 60 * 1000, tags: [CACHE_TAGS.USER] }
)

// Default TTL (5 minutes)
return withCache(
  () => fetchData(),
  'default-cache'
)
```

### Manual Cache Operations

Direct interaction with the cache manager:

```typescript
import { cacheManager, CACHE_TAGS } from "~/lib/cache-manager"

// Get cached data
const cachedCampaigns = cacheManager.get<Campaign[]>('campaigns')

// Set cache data
cacheManager.set('user-preferences', userPrefs, { ttl: 1 * 60 * 1000 })

// Invalidate specific entries
cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS)

// Invalidate by pattern
cacheManager.invalidate('/api/campaigns')

// Invalidate by regex
cacheManager.invalidate(/campaign/)

// Clear all cache
cacheManager.clear()

// Get cache statistics
const stats = cacheManager.getStats()
console.log(`Cache has ${stats.validEntries} valid entries`)
```

## Automatic Cache Invalidation

The system automatically invalidates cache when data changes through CRUD operations.

### Form Submissions (Create/Update)

Forms using `useFormWithValidation` automatically invalidate cache on successful submission:

```typescript
import { useFormWithValidation } from "~/hooks/useFormWithValidation"
import { CACHE_TAGS } from "~/lib/cache-manager"

const { submitForm } = useFormWithValidation({
  initialData: {
    title: '',
    description: '',
    // ... other fields
  },
  endpoint: '/api/campaigns',
  cacheKey: CACHE_TAGS.CAMPAIGNS, // Automatically invalidated on submit
  onSuccess: () => navigate('/admin/campaign'),
  entityName: 'Campaign'
})

// Cache is automatically invalidated when submitForm succeeds
await submitForm(formData, { isEditing, id })
```

### Delete Operations

Admin actions using `useAdminActions` automatically invalidate cache on delete:

```typescript
import { useAdminActions } from "~/hooks/useAdminActions"
import { CACHE_TAGS } from "~/lib/cache-manager"

const { handleDeleteConfirm } = useAdminActions({
  endpoint: '/api/campaigns',
  basePath: '/admin/campaign',
  cacheKey: CACHE_TAGS.CAMPAIGNS, // Automatically invalidated on delete
  entityName: 'Campaign'
})

// Cache is automatically invalidated when delete succeeds
```

### Manual Invalidation in Custom Operations

For custom operations that modify data:

```typescript
import { cacheManager, CACHE_TAGS } from "~/lib/cache-manager"

const handleCustomUpdate = async () => {
  try {
    await apiHelpers.put('/api/campaigns/bulk-update', updateData)
    
    // Manually invalidate affected caches
    cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS)
    
    toast.success('Bulk update completed')
  } catch (error) {
    toast.error('Bulk update failed')
  }
}
```

## Cache Lifecycle

### TTL-based Expiration

Cache entries automatically expire based on their TTL:

1. **Cache Hit**: When requesting data, check if entry exists and hasn't expired
2. **Cache Miss**: If entry doesn't exist or has expired, fetch fresh data
3. **Auto Cleanup**: Expired entries are removed when accessed

```typescript
// Example: 2-minute TTL for dynamic data
export async function clientLoader() {
  return withCache(
    () => fetchDynamicData(),
    'dynamic-data',
    { ttl: 2 * 60 * 1000 } // 2 minutes
  )
}
```

### Manual Invalidation Patterns

Different invalidation strategies for different scenarios:

```typescript
// Invalidate specific tag
cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS)

// Invalidate all campaign-related entries 
cacheManager.invalidate('campaign')

// Invalidate by API endpoint pattern
cacheManager.invalidate('/api/campaigns')

// Invalidate multiple tags
cacheManager.invalidateByTags([CACHE_TAGS.CAMPAIGNS, CACHE_TAGS.LANDINGPAGES])

// Complex pattern matching
cacheManager.invalidate(/^\/api\/(campaigns|landingpages)/)
```

## Integration with React Router

### Route-level Caching

Each route can have its own caching strategy:

```typescript
// app/routes/admin/campaign.tsx
export async function clientLoader(): Promise<PaginatedResponse<Campaign>> {
  return withCache(
    () => apiHelpers.paginated('/api/campaigns', { page: 1, per_page: 50 }),
    CACHE_TAGS.CAMPAIGNS,
    { ttl: 2 * 60 * 1000 } // 2 minutes for list views
  )
}

// app/routes/admin/dashboard.tsx  
export async function clientLoader(): Promise<DashboardData> {
  return withCache(
    () => apiHelpers.get('/api/dashboard'),
    'dashboard',
    { ttl: 5 * 60 * 1000 } // 5 minutes for dashboard
  )
}
```

### Cache Invalidation on Navigation

Cache automatically invalidates when users perform actions:

```typescript
// Campaign form submission
const handleSubmit = async (formData: Campaign) => {
  await submitForm(formData)
  // Cache automatically invalidated via useFormWithValidation
  // User redirected to list view with fresh data
}

// Delete action
const handleDelete = async (campaign: Campaign) => {
  await handleDeleteConfirm(campaign)
  // Cache automatically invalidated via useAdminActions
  // List view refreshes with updated data
}
```

## Performance Optimization

### Cache Hit Rate Optimization

- Use consistent cache keys across related components
- Set appropriate TTL values based on data volatility
- Group related data with common tags for efficient invalidation

```typescript
// Good: Consistent cache keys
const CACHE_KEYS = {
  CAMPAIGN_LIST: CACHE_TAGS.CAMPAIGNS,
  CAMPAIGN_DETAIL: (id: string) => `${CACHE_TAGS.CAMPAIGNS}:${id}`,
  CAMPAIGN_STATS: `${CACHE_TAGS.CAMPAIGNS}:stats`
}

// Efficient invalidation
cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS) // Invalidates all campaign data
```

### Memory Management

Monitor cache usage with statistics:

```typescript
const monitorCache = () => {
  const stats = cacheManager.getStats()
  
  console.log('Cache Statistics:', {
    total: stats.totalEntries,
    valid: stats.validEntries,
    expired: stats.expiredEntries,
    memoryUsage: `${(stats.totalSize / 1024).toFixed(2)} KB`
  })
  
  // Clear if cache gets too large
  if (stats.totalSize > 10 * 1024 * 1024) { // 10MB
    cacheManager.clear()
  }
}
```

### Selective Cache Invalidation

Use precise invalidation to maintain cache efficiency:

```typescript
// Instead of clearing all campaign cache
cacheManager.clear() // L Too aggressive

// Invalidate only what changed
cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS) //  Precise

// Or even more specific
cacheManager.invalidate(`${CACHE_TAGS.CAMPAIGNS}:${campaignId}`) //  Very precise
```

## Cache Statistics and Monitoring

### Real-time Statistics

Monitor cache performance and health:

```typescript
import { cacheManager } from "~/lib/cache-manager"

const CacheMonitor = () => {
  const [stats, setStats] = useState(cacheManager.getStats())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats())
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="cache-stats">
      <h3>Cache Statistics</h3>
      <p>Total Entries: {stats.totalEntries}</p>
      <p>Valid Entries: {stats.validEntries}</p>
      <p>Expired Entries: {stats.expiredEntries}</p>
      <p>Memory Usage: {(stats.totalSize / 1024).toFixed(2)} KB</p>
    </div>
  )
}
```

### Debug Mode

Enable debug logging for cache operations:

```typescript
// Add to cache-manager.ts for development
const DEBUG_CACHE = process.env.NODE_ENV === 'development'

export const cacheManager = {
  get<T>(key: string): T | null {
    const cached = clientCache.get(key)
    
    if (DEBUG_CACHE) {
      console.log(`Cache ${cached ? 'HIT' : 'MISS'} for key: ${key}`)
    }
    
    // ... rest of implementation
  },
  
  invalidate(keyPattern: string | RegExp) {
    if (DEBUG_CACHE) {
      console.log(`Cache INVALIDATE pattern: ${keyPattern}`)
    }
    
    // ... rest of implementation
  }
}
```

## Best Practices

### Cache Key Design

1. **Use constants** for consistency:
   ```typescript
   // Good
   const CACHE_KEY = CACHE_TAGS.CAMPAIGNS
   
   // Bad
   const cacheKey = 'campaigns' // Magic string
   ```

2. **Hierarchical naming** for related data:
   ```typescript
   // Good
   CACHE_TAGS.CAMPAIGNS              // List
   `${CACHE_TAGS.CAMPAIGNS}:${id}`   // Detail
   `${CACHE_TAGS.CAMPAIGNS}:stats`   // Aggregated
   ```

3. **Include relevant parameters** in cache keys:
   ```typescript
   // Good - different filters = different cache entries
   `${CACHE_TAGS.PROSPECTS}:${JSON.stringify(filters)}`
   
   // Bad - same cache key for different data
   CACHE_TAGS.PROSPECTS
   ```

### TTL Strategy

1. **Match data volatility**:
   ```typescript
   // Real-time data: 30 seconds
   { ttl: 30 * 1000 }
   
   // Dynamic content: 2-5 minutes  
   { ttl: 2 * 60 * 1000 }
   
   // Semi-static data: 10-30 minutes
   { ttl: 10 * 60 * 1000 }
   
   // Static data: 1+ hours
   { ttl: 60 * 60 * 1000 }
   ```

2. **Consider user context**:
   ```typescript
   // Admin data changes frequently
   { ttl: 2 * 60 * 1000 }
   
   // Public data changes less often
   { ttl: 15 * 60 * 1000 }
   ```

### Invalidation Strategy

1. **Use tags for logical grouping**:
   ```typescript
   // All campaign-related caches
   cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS)
   ```

2. **Cascade invalidation** for related data:
   ```typescript
   // When campaign changes, also invalidate dashboard
   const invalidateCampaignData = () => {
     cacheManager.invalidateByTags([
       CACHE_TAGS.CAMPAIGNS,
       'dashboard',
       'stats'
     ])
   }
   ```

3. **Granular invalidation** when possible:
   ```typescript
   // Instead of invalidating all campaigns
   cacheManager.invalidate(CACHE_TAGS.CAMPAIGNS)
   
   // Invalidate specific campaign if known
   cacheManager.invalidate(`${CACHE_TAGS.CAMPAIGNS}:${campaignId}`)
   ```

### Error Handling

Handle cache failures gracefully:

```typescript
const withCacheErrorHandling = async <T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  options: CacheOptions = {}
): Promise<T> => {
  try {
    return await withCache(fetcher, cacheKey, options)
  } catch (error) {
    console.warn(`Cache operation failed for ${cacheKey}:`, error)
    // Fallback to direct fetch
    return await fetcher()
  }
}
```

## File Structure

```
app/
   lib/
      cache-manager.ts          # Core cache implementation
      api.ts                    # API helpers with caching integration  
      types.ts                  # Type definitions
   hooks/
      useFormWithValidation.ts  # Auto-invalidation on form submit
      useAdminActions.ts        # Auto-invalidation on delete
   routes/
       admin/
           campaign.tsx          # Example: Route-level caching
           landingpage.tsx       # Example: Route-level caching
           prospects.tsx         # Example: Route-level caching
```

## Known Limitations

1. **Client-side only**: Cache is lost on page refresh
2. **Memory constraints**: Large datasets may impact performance
3. **Single-tab scope**: Cache not shared between browser tabs
4. **No persistence**: No localStorage/indexedDB integration

## Future Enhancements

- **Persistent storage** with localStorage/indexedDB fallback
- **Cross-tab synchronization** using BroadcastChannel
- **Background refresh** for expired entries
- **Cache compression** for large datasets
- **Smart prefetching** based on user navigation patterns
- **Cache metrics dashboard** for monitoring and optimization