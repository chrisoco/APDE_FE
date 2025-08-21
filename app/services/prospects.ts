import { apiHelpers } from "~/lib/api"
import type { SearchCriteriaResponse } from "~/lib/types"

export const prospectsService = {
  getSearchCriteria: async (): Promise<SearchCriteriaResponse> => {
    return apiHelpers.get<SearchCriteriaResponse>('/api/prospects/search-criteria', { 
      requiresAuth: true 
    })
  }
}