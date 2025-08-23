# Authentication Flow Documentation

This application uses Laravel Sanctum for SPA (Single Page Application) authentication with cookie-based session management.

## Overview

The authentication system consists of:
- **Frontend**: React Router v7 with client-side route protection
- **Backend**: Laravel Sanctum for API authentication
- **Session Management**: HTTP-only cookies for secure token storage
- **CSRF Protection**: XSRF tokens for state-changing operations
- **State Management**: Cookie-based authentication state checking

## Authentication Flow

### 1. Initial Setup

The backend must be configured to:
- Enable CORS for the frontend domain
- Set up Sanctum middleware
- Configure session and cookie domains

### 2. Login Process

#### Step 1: Initial Auth Check (clientLoader)

The login page checks if the user is already authenticated:

```typescript
export async function clientLoader() {
  if (hasAuthCookies()) {
    try {
      const response = await api("/api/user", { method: "GET" });
      if (response.ok) {
        // User is authenticated - redirect to admin
        throw redirect("/admin");
      }
    } catch (error) {
      // Handle redirect responses and API failures
      if (error instanceof Response && error.status !== 401) {
        throw error;
      }
    }
  }
  return null;
}
```

#### Step 2: Get CSRF Cookie

Before making any authenticated requests, fetch the CSRF cookie:

```typescript
await api("/sanctum/csrf-cookie", { method: "GET" });
```

This sets an `XSRF-TOKEN` cookie that will be used for subsequent requests.

#### Step 3: Submit Login Credentials

```typescript
await apiHelpers.post("/login", { email, password }, {
  includeCSRF: true
});
```

The `includeCSRF: true` option automatically:
- Reads the `XSRF-TOKEN` from cookies
- Adds it to the `X-XSRF-TOKEN` header

#### Step 4: Handle Login Response

```typescript
export async function clientAction({ request }: ClientActionFunctionArgs) {
  const fd = await request.formData();
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");

  try {
    await api("/sanctum/csrf-cookie", { method: "GET" });
    await apiHelpers.post("/login", { email, password }, { includeCSRF: true });
    return redirect("/admin");
  } catch (error) {
    let message = "Login failed";
    if (error instanceof Error && error.message.includes("API Error:")) {
      try {
        const errorMessage = error.message.split("API Error: ")[1];
        const data = JSON.parse(errorMessage.split(" ").slice(1).join(" "));
        if (data?.message) message = data.message;
      } catch (parseError) {
        console.debug('Failed to parse error message as JSON:', parseError);
      }
    }
    return { error: message };
  }
}
```

### 3. Route Protection

Protected routes use a `clientLoader` in the admin layout that verifies authentication:

```typescript
export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch {
    throw redirect("/admin/login");
  }
}
```

This loader:
- Runs before the component renders
- Makes an authenticated request to `/api/user`
- Redirects to login if the user is not authenticated
- Returns user data if authenticated
- Located in `app/routes/admin/_layout.tsx`

### 4. Authenticated Requests

All protected API calls should use `requiresAuth: true`:

```typescript
const data = await apiHelpers.get("/api/campaigns", {
  requiresAuth: true
});
```

This automatically redirects to `/admin/login` on 401 responses.

#### API Helper Methods

The API wrapper provides several helper methods:

```typescript
// GET request
const user = await apiHelpers.get("/api/user");

// POST request with data
const result = await apiHelpers.post("/api/campaigns", { 
  name: "Campaign Name",
  status: "active"
}, { 
  requiresAuth: true,
  includeCSRF: true 
});

// PUT request
const updated = await apiHelpers.put("/api/campaigns/1", updatedData, {
  requiresAuth: true,
  includeCSRF: true
});

// DELETE request
await apiHelpers.delete("/api/campaigns/1", { 
  requiresAuth: true,
  includeCSRF: true 
});

// Paginated requests (automatically fetches all pages)
const allCampaigns = await apiHelpers.paginated("/api/campaigns", {
  page: 1,
  per_page: 50
}, {
  requiresAuth: true
});
```

## File Structure

### Authentication Components

```
app/
├── lib/
│   ├── api.ts                    # API wrapper with auth handling
│   └── csrf.ts                   # CSRF token utilities
├── routes/
│   ├── login.tsx                 # Login page with auth logic
│   └── admin/
│       └── _layout.tsx           # Protected admin layout
├── components/
│   ├── login-form.tsx            # Login form component
│   └── nav-user.tsx              # User dropdown with logout
```

### Key Files

#### `app/lib/csrf.ts`

Utilities for managing CSRF tokens and auth state:

```typescript
export function getXsrfTokenFromCookie(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function hasAuthCookies(): boolean {
  // Check if we have XSRF token - this is set when user goes through auth flow
  return getXsrfTokenFromCookie() !== null;
}

export function clearAuthCookies(): void {
  // Clear XSRF token cookie
  document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/; SameSite=lax';
}
```

#### `app/routes/login.tsx`

Handles the login page with authentication logic and form:

```typescript
export async function clientLoader() {
  if (hasAuthCookies()) {
    try {
      const response = await api("/api/user", { method: "GET" });
      if (response.ok) {
        throw redirect("/admin");
      }
    } catch (error) {
      if (error instanceof Response && error.status !== 401) {
        throw error;
      }
    }
  }
  return null;
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const fd = await request.formData();
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");

  try {
    await api("/sanctum/csrf-cookie", { method: "GET" });
    await apiHelpers.post("/login", { email, password }, { includeCSRF: true });
    return redirect("/admin");
  } catch (error) {
    // Enhanced error parsing for better user feedback
    let message = "Login failed";
    if (error instanceof Error && error.message.includes("API Error:")) {
      try {
        const errorMessage = error.message.split("API Error: ")[1];
        const data = JSON.parse(errorMessage.split(" ").slice(1).join(" "));
        if (data?.message) message = data.message;
      } catch (parseError) {
        console.debug('Failed to parse error message as JSON:', parseError);
      }
    }
    return { error: message };
  }
}
```

#### `app/components/login-form.tsx`

Reusable login form component with form validation and error display:

```typescript
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const actionData = useActionData() as { error?: string } | undefined
  const nav = useNavigation()
  const busy = nav.state === "submitting"
  const [email, setEmail] = useState("john@doe.com")
  const [password, setPassword] = useState("1234")

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form method="post" className="p-6 md:p-8">
            {/* Form fields with error display */}
            {actionData?.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {actionData.error}
              </div>
            )}
            <Button 
              type="submit" 
              disabled={busy}
            >
              {busy ? "Signing in..." : "Login"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### `app/routes/admin/_layout.tsx`

Protected layout that checks authentication and handles logout:

```typescript
export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch {
    throw redirect("/admin/login");
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    try {
      await apiHelpers.post("/logout", {}, {
        requiresAuth: true,
        includeCSRF: true
      });
    } catch (error) {
      console.warn("Logout failed:", error);
    }
    
    clearAuthCookies();
    return redirect("/admin/login");
  }

  return null;
}
```

## Security Considerations

### CSRF Protection

- All state-changing operations (POST, PUT, DELETE) require CSRF tokens
- The API wrapper automatically handles CSRF token extraction and headers
- Use `includeCSRF: true` for authentication endpoints

### Cookie Security

Backend should configure cookies with:
```php
'same_site' => 'lax',
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,
```

### CORS Configuration

Backend CORS should allow:
- Frontend domain in `Access-Control-Allow-Origin`
- `credentials: true` for cookie sharing
- Necessary headers (`Content-Type`, `X-XSRF-TOKEN`, etc.)

## Error Handling

### Authentication Errors

The API wrapper automatically handles:
- **401 Unauthorized**: Redirects to `/admin/login` when `requiresAuth: true`
- **CSRF Failures**: Shows descriptive error messages
- **Network Errors**: Provides fallback error messages

### User Feedback

Login form shows specific error messages:

```typescript
const actionData = useActionData<typeof clientAction>();

{actionData?.error && (
  <p className="text-red-600">{actionData.error}</p>
)}
```

## Logout Implementation

Logout is implemented in the admin layout and triggered via the user navigation component:

### Admin Layout Action (app/routes/admin/_layout.tsx)

```typescript
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    try {
      await apiHelpers.post("/logout", {}, {
        requiresAuth: true,
        includeCSRF: true
      });
    } catch (error) {
      console.warn("Logout failed:", error);
    }
    
    // Clear client-side auth cookies
    clearAuthCookies();
    return redirect("/admin/login");
  }

  return null;
}
```

### User Navigation Component (app/components/nav-user.tsx)

```typescript
<DropdownMenuItem asChild>
  <button 
    type="button" 
    className="w-full"
    onClick={() => {
      fetcher.submit(
        { intent: "logout" },
        { method: "post", action: "/admin" }
      )
    }}
  >
    <LogOut />
    Log out
  </button>
</DropdownMenuItem>
```

## Environment Setup

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

The API base URL is configured in `app/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
```

### Backend Configuration

Ensure your Laravel application has:
- Sanctum installed and configured
- Proper CORS settings
- Session domain configuration
- CSRF middleware enabled

## Troubleshooting

### Common Issues

1. **CSRF Token Missing**: Ensure `/sanctum/csrf-cookie` is called before login
2. **CORS Errors**: Check backend CORS configuration
3. **Infinite Redirects**: Verify `/api/user` endpoint returns proper responses
4. **Cookie Not Set**: Check domain configuration in backend

### Debug Tips

```typescript
// Check if CSRF token exists
const token = getXsrfTokenFromCookie();
console.log("CSRF Token:", token);

// Check auth cookie state
console.log("Has auth cookies:", hasAuthCookies());

// Log API responses
const response = await api("/api/user");
console.log("Auth check status:", response.status);

// Enhanced error logging in login action
catch (error) {
  console.debug('Login error details:', error);
  if (error instanceof Error && error.message.includes("API Error:")) {
    console.debug('API Error details:', error.message);
  }
}
```