# Search Filter Component

A generic, reusable component for creating dynamic search filters based on API-provided criteria. The `SearchFilter` component automatically generates form controls based on search criteria retrieved from an API endpoint, while `ProspectFilter` provides a prospect-specific implementation.

## Overview

The search filter system consists of two main layers:
1. **SearchFilter** - A generic component that handles dynamic filter generation based on API criteria
2. **ProspectFilter** - A specialized wrapper that configures SearchFilter for prospect data

The system supports real-time filter counts, flexible filter modes (range vs exact), and multiple data types.

## Components

### Main Components
- `SearchFilter` (`~/components/ui/search-filter.tsx`) - Generic search filter component
- `ProspectFilter` (`~/components/prospect-filter.tsx`) - Prospect-specific implementation
- `RangeSlider` (`~/components/ui/range-slider.tsx`) - Dual-handle slider for min/max values
- `MultiSelect` (`~/components/ui/multi-select.tsx`) - Multi-select combobox with badges

### Supporting Components
- `Slider` (`~/components/ui/slider.tsx`) - Base Radix UI slider with dual thumbs for range selection
- `Badge` (`~/components/ui/badge.tsx`) - Display component for selected items
- `DatePicker` (`~/components/ui/date-picker.tsx`) - Date selection component for date ranges

## Filter Types

The SearchFilter component automatically detects and renders appropriate UI controls based on the data type from the search criteria API.

### 1. Numeric Range Filters
Fields with `{ min: number, max: number }` format support two interactive modes:

**Range Mode (default)**
- Dual-handle `RangeSlider` component for visual range selection
- Synchronized min/max input fields for precise numeric entry
- Automatic validation to prevent min > max
- Example: `{ min_age: 25, max_age: 65 }`

**Exact Value Mode**
- Single number input for exact matches
- Radio button toggle to switch between modes
- Mode state tracked with `{field}_mode` key
- Example: `{ age: 30, age_mode: "exact" }`

### 2. Date Range Filters
Fields with `{ min: string, max: string }` where field name contains "date":
- Two `DatePicker` components for start/end dates
- ISO date string handling with proper formatting
- Example: `{ min_birth_date: "1990-01-01", max_birth_date: "2000-12-31" }`

### 3. Multi-Select Array Filters
Fields with `string[]` arrays use `MultiSelect` component:
- Multi-select combobox with search functionality
- Badge display for selected items with remove buttons
- Supports both single and multiple selections
- Nullable design - can be completely empty
- Intelligent storage: single string for one item, array for multiple
- Example: `{ source: "kueba" }` or `{ source: ["kueba", "erp"] }`

### 4. String Range Filters
Fields with `{ min: string, max: string }` (non-date):
- Two text input fields for min/max string values
- Useful for postal codes, alphanumeric ranges
- Example: postal code ranges like `{ min_plz: "10000", max_plz: "99999" }`

## API Integration

The SearchFilter component integrates with two API endpoints to provide dynamic filtering capabilities.

### Search Criteria Endpoint
```typescript
GET /api/prospects/search-criteria
```

Returns available filter criteria with data ranges and options:
```json
{
  "age": { "min": 22, "max": 80 },
  "height": { "min": 150, "max": 200 },
  "weight": { "min": 45, "max": 120 },
  "gender": ["female", "male"],
  "source": ["erp", "kueba"],
  "blood_group": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "eye_color": ["brown", "blue", "green", "hazel", "gray"],
  "hair_color": ["black", "brown", "blonde", "red", "gray", "white"],
  "birth_date": {
    "min": "1945-05-20T00:00:00.000000Z",
    "max": "2002-04-20T00:00:00.000000Z"
  },
  "address.city": ["Berlin", "Munich", "Hamburg", "Cologne"],
  "address.state": ["Berlin", "Bavaria", "Hamburg", "North Rhine-Westphalia"],
  "address.country": ["Germany"],
  "address.plz": { "min": "01067", "max": "99998" },
  "address.latitude": { "min": 47.2701114, "max": 54.9079095 },
  "address.longitude": { "min": 5.8662547, "max": 15.0419319 }
}
```

### Filter Count Endpoint (Optional)
```typescript
GET /api/prospects/filter?params...
```

When `showCount={true}`, provides real-time count of matching records:
```json
{
  "data": [...],
  "meta": {
    "total": 1234,
    "current_page": 1,
    "per_page": 50,
    "last_page": 25
  }
}
```

Count requests are:
- Debounced by 500ms to avoid excessive API calls
- Include `per_page: 1` to minimize data transfer
- Only sent when filters have values

## Filter Data Transformation

The SearchFilter component uses a flat internal format for form state management and transforms data appropriately when sending to APIs.

### Internal Format (Form State)
The component stores all filter values in a flattened structure:
```typescript
{
  // Numeric range filters (when in range mode)
  min_age: 25,
  max_age: 65,
  
  // Exact value filters (when in exact mode)
  age: 30,
  age_mode: "exact", // Mode tracking field
  
  // Multi-select filters (flexible storage)
  gender: "female",              // Single selection as string
  source: ["kueba", "erp"],      // Multiple selections as array
  
  // Date range filters (ISO strings)
  min_birth_date: "1990-01-01",
  max_birth_date: "2000-12-31",
  
  // String range filters
  min_address_plz: "10000",
  max_address_plz: "99999"
}
```

### API Query Parameters Format
When sending filter counts or actual filter requests, the component transforms the internal format:

```typescript
// Internal to query params transformation:
{
  min_age: 25,           → min_age: 25
  max_age: 65,           → max_age: 65
  source: ["kueba"],     → source_in[]: ["kueba"]  
  gender: "female",      → gender: "female"
  
  // Mode tracking fields are excluded
  age_mode: "exact"      → (excluded from API calls)
}
```

The `transformFilterToQueryParams()` function handles:
- Filtering out null/undefined/empty values
- Converting arrays to `{field}_in[]` format for backend processing
- Excluding mode tracking fields (`*_mode`)
- Preserving min/max prefixes for range queries

## Usage

### ProspectFilter Component (Recommended)
The `ProspectFilter` component is a pre-configured wrapper for prospect data:

```tsx
import { ProspectFilter } from "~/components/prospect-filter"
import type { ProspectFilter as ProspectFilterType } from "~/lib/types"

function MyComponent() {
  const [filters, setFilters] = useState<ProspectFilterType>({})

  return (
    <ProspectFilter
      value={filters}
      onValueChange={setFilters}
      showCount={true}
      className="w-full"
    />
  )
}
```

### Generic SearchFilter Component
For custom implementations or other data types:

```tsx
import { SearchFilter, type FilterValue } from "~/components/ui/search-filter"

const fieldLabels = {
  age: "Age",
  height: "Height (cm)",
  gender: "Gender",
  source: "Data Source"
}

<SearchFilter
  criteriaEndpoint="/api/custom/search-criteria"
  filterEndpoint="/api/custom/filter" // Optional
  value={filters}
  onValueChange={setFilters}
  title="Custom Filters"
  fieldLabels={fieldLabels}
  className="border rounded-lg"
  showCount={true}
/>
```

### Campaign Form Integration
In campaign forms, the ProspectFilter is integrated as part of the form data:

```tsx
import { ProspectFilter } from "~/components/prospect-filter"
import type { ProspectFilter as ProspectFilterType } from "~/lib/types"

type Campaign = {
  title: string
  description: string
  prospect_filter?: ProspectFilterType
  // ... other fields
}

export default function CampaignForm() {
  const [formData, setFormData] = useState<Campaign>({
    title: '',
    description: '',
    prospect_filter: {}
  })

  return (
    <form>
      {/* Other form fields */}
      
      <div className="space-y-2">
        <ProspectFilter
          value={formData.prospect_filter}
          onValueChange={(filter) => setFormData({ 
            ...formData, 
            prospect_filter: filter 
          })}
        />
      </div>
    </form>
  )
}
```

## Features

### Real-time Filter Count
- **Debounced API calls**: 500ms delay prevents excessive server requests
- **Live updates**: Shows total matching records as filters change
- **Smart filtering**: Only sends API requests when filters have actual values
- **Loading states**: Visual feedback during count fetching

### Flexible Filter Modes
- **Nullable design**: All filters start empty and can be cleared completely
- **Dual-mode numeric**: Range sliders OR exact value input with radio toggle
- **Smart multi-select**: Single strings for one item, arrays for multiple
- **Mode persistence**: Remembers user's choice between range/exact modes

### Intelligent Data Handling
- **Type detection**: Automatically renders appropriate controls based on API data
- **Validation**: Min/max constraints on numeric inputs prevent invalid ranges  
- **Clean state**: Removes null/undefined values to keep filter object minimal
- **Dot notation**: Supports nested field names like `address.city`

### User Experience
- **Visual feedback**: RangeSlider with dual thumbs and synchronized inputs  
- **Search capability**: Multi-select dropdowns include search functionality
- **Badge interface**: Selected items displayed as removable badges
- **Loading states**: Skeleton loading during initial criteria fetch
- **Error handling**: Graceful fallbacks when API requests fail

## File Structure

```
app/
├── components/
│   ├── ui/
│   │   ├── search-filter.tsx       # Generic search filter component
│   │   ├── range-slider.tsx        # Dual-handle slider for numeric ranges
│   │   ├── multi-select.tsx        # Multi-select combobox with badges
│   │   ├── slider.tsx              # Base Radix UI slider (dual thumbs)
│   │   ├── badge.tsx               # Badge component for selected items
│   │   ├── date-picker.tsx         # Date selection component
│   │   ├── card.tsx                # Card wrapper component
│   │   ├── input.tsx               # Input field component
│   │   └── label.tsx               # Label component
│   └── prospect-filter.tsx         # Prospect-specific filter wrapper
├── lib/
│   ├── types.ts                    # ProspectFilter interface definition
│   ├── api.ts                      # API helpers with authentication
│   └── utils.ts                    # Utility functions (cn, etc.)
```

## Component Architecture

### SearchFilter (Generic Component)
**Location**: `~/components/ui/search-filter.tsx`

**Key Functions**:
- `fetchSearchCriteria()` - Loads available filter options from API
- `fetchFilterCount()` - Gets real-time count with debouncing
- `transformFilterToQueryParams()` - Converts internal state to API format
- `renderRangeField()` - Renders numeric fields with dual modes
- `renderDateRangeField()` - Renders date range pickers
- `renderArrayField()` - Renders multi-select dropdowns
- `renderStringRangeField()` - Renders string min/max inputs

**State Management**:
```typescript
const [searchCriteria, setSearchCriteria] = useState<SearchCriteriaResponse | null>(null)
const [loading, setLoading] = useState(true)
const [filterCount, setFilterCount] = useState<number | null>(null)
const [countLoading, setCountLoading] = useState(false)
```

### ProspectFilter (Specialized Wrapper)
**Location**: `~/components/prospect-filter.tsx`

Pre-configured with:
- Endpoint: `/api/prospects/search-criteria`
- Filter endpoint: `/api/prospects/filter`
- Field labels for all prospect attributes
- TypeScript integration with `ProspectFilter` interface

## Best Practices

### Implementation Guidelines

1. **Field Naming Conventions**
   - Use `min_` and `max_` prefixes for range fields
   - Use dot notation for nested fields (`address.city`)
   - Keep field names consistent between API and frontend

2. **Nullable Design Philosophy**
   - All filters start empty and remain optional
   - Users can clear any filter completely
   - Empty filters are excluded from API requests

3. **Performance Optimization**
   - Debounce API calls (500ms for count requests)
   - Only send non-empty values to reduce payload size
   - Use `per_page: 1` for count-only requests

4. **Type Safety**
   - Define proper TypeScript interfaces for filter data
   - Use generic `FilterValue` type for reusability
   - Maintain type consistency between components

5. **User Experience**
   - Provide clear visual feedback for loading states
   - Handle API errors gracefully with fallback messages
   - Include proper labels and accessibility attributes
   - Support keyboard navigation for all interactive elements

### Common Patterns

```typescript
// Proper filter state initialization
const [filters, setFilters] = useState<ProspectFilter>({})

// Handle filter updates with type safety
const handleFilterChange = (newFilters: ProspectFilter) => {
  setFilters(newFilters)
  // Additional processing if needed
}

// Use ProspectFilter wrapper for consistency
<ProspectFilter
  value={filters}
  onValueChange={handleFilterChange}
  showCount={true}
/>
```

## Integration with Form Systems

The SearchFilter components are designed to work seamlessly with form libraries and validation systems:

```typescript
// With useFormWithValidation hook
const { formData, updateFormData } = useFormWithValidation({
  initialData: {
    title: '',
    prospect_filter: {}
  }
  // ... other config
})

<ProspectFilter
  value={formData.prospect_filter}
  onValueChange={(filter) => updateFormData({ prospect_filter: filter })}
/>
```

## Known Limitations

1. **Date Field Detection**: Currently uses simple string matching for "date" in field names
2. **Field Validation**: Basic min/max validation only; no custom validation rules
3. **Mobile Optimization**: Range sliders may need touch improvements on small screens
4. **Complex Operators**: Only supports basic equals/range operations, not "contains" or "starts with"