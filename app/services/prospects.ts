import { apiHelpers } from "~/lib/api"

export interface SearchCriteriaResponse {
  source?: string[]
  gender?: string[]
  age?: { min: number; max: number }
  birth_date?: { min: string; max: string }
  blood_group?: string[]
  height?: { min: number; max: number }
  weight?: { min: number; max: number }
  eye_color?: string[]
  hair_color?: string[]
  "address.city"?: string[]
  "address.state"?: string[]
  "address.country"?: string[]
  "address.plz"?: { min: string; max: string }
  "address.latitude"?: { min: number; max: number }
  "address.longitude"?: { min: number; max: number }
}

export interface ProspectFilter {
  [key: string]: any
}

export const prospectsService = {
  getSearchCriteria: async (): Promise<SearchCriteriaResponse> => {
    return apiHelpers.get<SearchCriteriaResponse>('/api/prospects/search-criteria', { 
      requiresAuth: true 
    })
  }
}