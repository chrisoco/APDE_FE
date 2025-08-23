import { SearchFilter, type FilterValue } from "~/components/ui/search-filter"
import type { ProspectFilter } from "~/lib/types"

interface ProspectFilterProps {
  value?: ProspectFilter
  onValueChange?: (value: ProspectFilter) => void
  className?: string
  showCount?: boolean
}

const fieldLabels = {
  age: "Age",
  height: "Height (cm)",
  weight: "Weight (kg)",
  birth_date: "Birth Date",
  source: "Source",
  gender: "Gender",
  blood_group: "Blood Group",
  eye_color: "Eye Color",
  hair_color: "Hair Color",
  "address.city": "City",
  "address.state": "State",
  "address.country": "Country",
  "address.plz": "Postal Code",
  "address.latitude": "Latitude",
  "address.longitude": "Longitude",
}

export function ProspectFilter({ 
  value = {}, 
  onValueChange, 
  className, 
  showCount = true 
}: ProspectFilterProps) {
  return (
    <SearchFilter
      criteriaEndpoint="/api/prospects/search-criteria"
      filterEndpoint="/api/prospects/filter"
      value={value as FilterValue}
      onValueChange={onValueChange as ((value: FilterValue) => void) | undefined}
      title="Prospect Filters"
      fieldLabels={fieldLabels}
      className={className}
      showCount={showCount}
    />
  )
}