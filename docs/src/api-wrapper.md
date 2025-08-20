# API Wrapper Documentation

The API wrapper (`app/lib/api.ts`) provides a centralized way to handle HTTP requests to your backend API with consistent configuration and error handling.

## Configuration

The wrapper automatically configures:
- Base URL from `VITE_API_URL` environment variable (defaults to `http://localhost:8000`)
- Credentials include for cookie-based authentication
- JSON headers (`Accept` and `Content-Type`)
- CSRF token handling for Laravel Sanctum

## Basic Usage

### Import

```typescript
import { api, apiJson, apiHelpers } from "../lib/api";
```

### Core Functions

#### `api(endpoint, options)`

Low-level fetch wrapper that returns a `Response` object.

```typescript
const response = await api("/api/users", {
  method: "GET",
  requiresAuth: true
});
```

#### `apiJson(endpoint, options)`

Higher-level wrapper that automatically parses JSON responses and handles errors.

```typescript
const users = await apiJson<User[]>("/api/users", {
  method: "GET",
  requiresAuth: true
});
```

### Helper Methods

#### GET Requests

```typescript
// Simple GET
const user = await apiHelpers.get<User>("/api/user");

// GET with authentication required
const protectedData = await apiHelpers.get("/api/protected", {
  requiresAuth: true
});

// GET with query parameters
const filtered = await apiHelpers.get("/api/users", {
  params: { status: "active", role: "admin" }
});
```

#### POST Requests

```typescript
// POST with data
const newUser = await apiHelpers.post<User>("/api/users", {
  name: "John Doe",
  email: "john@example.com"
});

// POST with CSRF token (for authentication endpoints)
await apiHelpers.post("/login", { email, password }, {
  includeCSRF: true
});
```

#### PUT Requests

```typescript
const updatedUser = await apiHelpers.put<User>(`/api/users/${id}`, {
  name: "Jane Doe",
  email: "jane@example.com"
}, {
  requiresAuth: true
});
```

#### DELETE Requests

```typescript
await apiHelpers.delete(`/api/users/${id}`, {
  requiresAuth: true
});
```

#### Paginated Requests

```typescript
interface CampaignResponse {
  data: Campaign[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const campaigns = await apiHelpers.paginated<CampaignResponse>(
  "/api/campaigns",
  { page: 2, per_page: 10 },
  { requiresAuth: true }
);
```

## Options

### `ApiOptions`

```typescript
interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;     // Auto-redirect to /login on 401
  includeCSRF?: boolean;      // Include XSRF token header
  params?: Record<string, string | number | boolean>; // Query parameters
}
```

### `PaginationOptions`

```typescript
interface PaginationOptions {
  page?: number;      // Page number (default: 1)
  per_page?: number;  // Items per page (default: 10)
}
```

## Error Handling

The wrapper automatically:
- Throws errors for non-2xx responses
- Redirects to `/login` when `requiresAuth: true` and response is 401
- Includes response status and error text in error messages

```typescript
try {
  const data = await apiHelpers.get("/api/protected", { requiresAuth: true });
} catch (error) {
  // Will automatically redirect to /login if 401
  // Or throw descriptive error for other status codes
  console.error("API Error:", error.message);
}
```

## Environment Variables

Set your backend URL in `.env`:

```env
VITE_API_URL=https://your-api.com
```

## Examples

### Fetching User Data in a Route Loader

```typescript
import { apiHelpers } from "../lib/api";

export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch (error) {
    throw redirect("/login");
  }
}
```

### Form Submission with CSRF

```typescript
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  try {
    // Get CSRF cookie first
    await api("/sanctum/csrf-cookie", { method: "GET" });
    
    // Login with CSRF token
    await apiHelpers.post("/login", { email, password }, {
      includeCSRF: true
    });
    
    return redirect("/admin");
  } catch (error) {
    return { error: error.message };
  }
}
```

### Component Data Fetching

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await apiHelpers.paginated("/api/items", 
        { page: currentPage, per_page: 20 },
        { requiresAuth: true }
      );
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [currentPage]);
```