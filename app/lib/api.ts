import { getXsrfTokenFromCookie } from "./csrf";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  includeCSRF?: boolean;
  params?: Record<string, string | number | boolean>;
}

export async function api(endpoint: string, options: ApiOptions = {}): Promise<Response> {
  const { requiresAuth = false, includeCSRF = false, params, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, String(value));
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

export async function apiJson<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const response = await api(endpoint, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

export interface PaginationOptions {
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

  paginated: <T = any>(
    endpoint: string, 
    pagination: PaginationOptions = {}, 
    options?: Omit<ApiOptions, 'method'>
  ) => {
    const { page = 1, per_page = 10 } = pagination;
    return apiJson<T>(endpoint, {
      ...options,
      method: 'GET',
      params: {
        page,
        per_page,
        ...options?.params
      }
    });
  },
};