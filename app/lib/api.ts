import { getXsrfTokenFromCookie } from "./csrf";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  includeCSRF?: boolean;
  params?: Record<string, string | number | boolean | string[]>;
}

export async function api(endpoint: string, options: ApiOptions = {}): Promise<Response> {
  const { requiresAuth = false, includeCSRF = false, params, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For arrays, append each value with the same key (for query params like key[]=val1&key[]=val2)
        value.forEach(item => {
          urlParams.append(key, String(item));
        });
      } else {
        urlParams.append(key, String(value));
      }
    });
    url += `${url.includes('?') ? '&' : '?'}${urlParams.toString()}`;
  }
  
  const headers: HeadersInit = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (includeCSRF) {
    const xsrfToken = getXsrfTokenFromCookie();

    if (xsrfToken) {
        (headers as any)["X-XSRF-TOKEN"] = xsrfToken;
    }
  }

  const config: RequestInit = {
    credentials: "include",
    ...fetchOptions,
    headers,
  };

  const response = await fetch(url, config);

  if (requiresAuth && !response.ok && response.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Authentication required");
  }

  return response;
}

async function apiJson<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const response = await api(endpoint, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

interface PaginationOptions {
  page?: number;
  per_page?: number;
}

export const apiHelpers = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiJson<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiJson<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiJson<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiJson<T>(endpoint, { ...options, method: 'DELETE' }),

  paginated: async <T = any>(
    endpoint: string, 
    pagination: PaginationOptions = {}, 
    options?: Omit<ApiOptions, 'method'>
  ): Promise<T> => {
    const { page = 1, per_page = 10 } = pagination;
    
    // First request to get initial data and total count
    const firstResponse = await apiJson<T>(endpoint, {
      ...options,
      method: 'GET',
      params: {
        page,
        per_page,
        ...options?.params
      }
    });

    // Check if this is a paginated response with meta information
    if (
      firstResponse && 
      typeof firstResponse === 'object' && 
      'meta' in firstResponse && 
      'data' in firstResponse
    ) {
      const paginatedResponse = firstResponse as any;
      const { total, per_page: actualPerPage, last_page } = paginatedResponse.meta;
      
      // If we have more data than fits on one page, fetch all pages
      if (total > actualPerPage && last_page > 1) {
        const allData = [...paginatedResponse.data];
        const promises = [];
        
        // Create promises for all remaining pages
        for (let currentPage = 2; currentPage <= last_page; currentPage++) {
          promises.push(
            apiJson<T>(endpoint, {
              ...options,
              method: 'GET',
              params: {
                page: currentPage,
                per_page: actualPerPage,
                ...options?.params
              }
            })
          );
        }
        
        // Execute all requests in parallel
        const remainingResponses = await Promise.all(promises);
        
        // Combine all data
        remainingResponses.forEach(response => {
          if (response && typeof response === 'object' && 'data' in response) {
            allData.push(...(response as any).data);
          }
        });
        
        // Return the combined response with all data
        return {
          ...paginatedResponse,
          data: allData,
          meta: {
            ...paginatedResponse.meta,
            current_page: 1,
            per_page: allData.length // Update per_page to reflect actual count
          }
        } as T;
      }
    }
    
    // Return original response if not paginated or only one page
    return firstResponse;
  },
};