# Search Filter Component

A generic, reusable component for creating dynamic search filters based on API-provided criteria. Supports multiple filter types including ranges, exact values, and multi-select options.

## Overview

The `SearchFilter` component automatically generates form controls based on search criteria retrieved from an API endpoint. It supports real-time filter counts and flexible filter modes.

## Components

### Main Components
- `SearchFilter` - Generic search filter component
- `ProspectFilter` - Prospect-specific implementation
- `RangeSlider` - Dual-handle slider for min/max values
- `MultiSelect` - Multi-select combobox with badges

### Supporting Components
- `Slider` - Base Radix UI slider with dual thumbs
- `Badge` - Display component for selected items

## Filter Types

### 1. Numeric Range Filters
Fields with `{ min: number, max: number }` format support two modes:

**Range Mode (default)**
- Dual-handle slider for visual range selection
- Min/Max input fields for precise values
- Example: `{ min_age: 25, max_age: 65 }`

**Exact Value Mode**
- Single input field for exact matches
- Radio button toggle between modes
- Example: `{ age: 30 }`

### 2. Date Range Filters
Fields with `{ min: string, max: string }` where field name contains "date":
- Date picker components for start/end dates
- Example: `{ min_birth_date: "1990-01-01", max_birth_date: "2000-12-31" }`

### 3. Multi-Select Filters
Fields with `string[]` arrays:
- Multi-select combobox with search
- Supports both single and multiple selections
- Nullable - can be left empty
- Example: `{ source: "kueba" }` or `{ source: ["kueba", "erp"] }`

### 4. String Range Filters
Fields with `{ min: string, max: string }` (non-date):
- Simple text inputs for min/max values
- Example: postal code ranges

## API Integration

### Search Criteria Endpoint
```typescript
GET /api/prospects/search-criteria
```

Expected response format:
```json
{
  "age": { "min": 22, "max": 80 },
  "gender": ["female", "male"],
  "source": ["erp", "kueba"],
  "birth_date": {
    "min": "1945-05-20T00:00:00.000000Z",
    "max": "2002-04-20T00:00:00.000000Z"
  }
}
```

### Filter Count Endpoint
```typescript
GET /api/prospects/filter?params...
```

Expected response format:
```json
{
  "data": [...],
  "meta": {
    "total": 1234
  }
}
```

## Filter Data Transformation

### Internal Format (Form State)
```typescript
{
  // Range filters
  min_age: 25,
  max_age: 65,
  
  // Exact filters  
  gender: "female",
  source: ["kueba", "erp"],
  
  // Mode tracking (excluded from API)
  age_mode: "exact"
}
```

### API Format (Backend)
```typescript
{
  // Range object
  age: { min: 25, max: 65 },
  
  // Direct values
  gender: "female",
  source: ["kueba", "erp"]
}
```

## Usage

### Basic Implementation
```tsx
import { SearchFilter } from "~/components/ui/search-filter"

<SearchFilter
  criteriaEndpoint="/api/prospects/search-criteria"
  filterEndpoint="/api/prospects/filter"
  value={filters}
  onValueChange={setFilters}
  title="Prospect Filters"
  showCount={true}
/>
```

### Custom Implementation
```tsx
const fieldLabels = {
  age: "Age",
  gender: "Gender",
  source: "Data Source"
}

<SearchFilter
  criteriaEndpoint="/api/custom/search-criteria"
  filterEndpoint="/api/custom/filter"
  value={filters}
  onValueChange={setFilters}
  title="Custom Filters"
  fieldLabels={fieldLabels}
  className="my-custom-class"
  showCount={true}
/>
```

### Campaign Integration
```tsx
// In campaign form
const [formData, setFormData] = useState({
  title: '',
  description: '',
  prospect_filter: {}
})

<ProspectFilter
  value={formData.prospect_filter}
  onValueChange={(filter) => setFormData({ 
    ...formData, 
    prospect_filter: filter 
  })}
/>
```

## Features

### Real-time Filter Count
- Debounced API calls (500ms)
- Shows total matching records
- Excludes null/empty values from count

### Flexible Filter Modes
- **Nullable**: All fields start empty and can be cleared
- **Multi-mode**: Numeric fields support both range and exact value modes
- **Multi-select**: All array fields support multiple selections

### Data Validation
- Min/max constraints on numeric inputs
- Date validation for date ranges
- Empty value filtering for API calls

### Responsive Design
- Mobile-friendly slider controls
- Collapsible filter sections
- Badge display for selected items

## File Structure

```
app/
├── components/
│   ├── ui/
│   │   ├── search-filter.tsx       # Generic search filter
│   │   ├── range-slider.tsx        # Dual-handle slider
│   │   ├── multi-select.tsx        # Multi-select combobox
│   │   ├── slider.tsx              # Base slider component
│   │   └── badge.tsx               # Badge component
│   └── prospect-filter.tsx         # Prospect-specific filter
├── utils/
│   └── prospect-filter.ts          # Transformation utilities
└── services/
    └── prospects.ts                # API service
```

## Transformation Utilities

### transformFilterForAPI()
Converts internal form format to API format:
- Combines min/max fields into range objects
- Preserves direct value mappings
- Excludes mode tracking fields

### transformFilterFromAPI()
Converts API format to internal form format:
- Splits range objects into min/max fields
- Preserves direct value mappings
- Handles both string and array values

## Best Practices

1. **Field Naming**: Use consistent naming conventions (`min_`, `max_` prefixes)
2. **Nullable Design**: Always make filters optional for better UX
3. **API Efficiency**: Only send non-empty values to reduce payload
4. **Debouncing**: Use debounced API calls for real-time features
5. **Error Handling**: Gracefully handle API failures
6. **Accessibility**: Include proper labels and keyboard navigation

## Future Enhancements

- Custom filter operators (contains, starts with, etc.)
- Filter presets and saved searches
- Advanced date/time filtering
- Numeric step customization
- Custom validation rules
- Export/import filter configurations