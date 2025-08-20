# Authentication Flow Documentation

This application uses Laravel Sanctum for SPA (Single Page Application) authentication with cookie-based session management.

## Overview

The authentication system consists of:
- **Frontend**: React Router with client-side route protection
- **Backend**: Laravel Sanctum for API authentication
- **Session Management**: HTTP-only cookies for secure token storage
- **CSRF Protection**: XSRF tokens for state-changing operations

## Authentication Flow

### 1. Initial Setup

The backend must be configured to:
- Enable CORS for the frontend domain
- Set up Sanctum middleware
- Configure session and cookie domains

### 2. Login Process

#### Step 1: Get CSRF Cookie

Before making any authenticated requests, fetch the CSRF cookie:

```typescript
await api("/sanctum/csrf-cookie", { method: "GET" });
```

This sets an `XSRF-TOKEN` cookie that will be used for subsequent requests.

#### Step 2: Submit Login Credentials

```typescript
await apiHelpers.post("/login", { email, password }, {
  includeCSRF: true
});
```

The `includeCSRF: true` option automatically:
- Reads the `XSRF-TOKEN` from cookies
- Adds it to the `X-XSRF-TOKEN` header

#### Step 3: Redirect on Success

```typescript
export async function clientAction({ request }: Route.ClientActionArgs) {
  // ... get form data
  
  try {
    await api("/sanctum/csrf-cookie", { method: "GET" });
    await apiHelpers.post("/login", { email, password }, {
      includeCSRF: true
    });
    return redirect("/admin");
  } catch (error) {
    return { error: error.message };
  }
}
```

### 3. Route Protection

Protected routes use a `clientLoader` that verifies authentication:

```typescript
export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch (error) {
    throw redirect("/admin/login");
  }
}
```

This loader:
- Runs before the component renders
- Makes an authenticated request to `/api/user`
- Redirects to login if the user is not authenticated
- Returns user data if authenticated

### 4. Authenticated Requests

All protected API calls should use `requiresAuth: true`:

```typescript
const data = await apiHelpers.get("/api/campaigns", {
  requiresAuth: true
});
```

This automatically redirects to `/admin/login` on 401 responses.

## File Structure

### Authentication Components

```
app/
├── lib/
│   ├── api.ts          # API wrapper with auth handling
│   └── csrf.ts         # CSRF token utilities
├── routes/
│   ├── login.tsx       # Login form and action
│   └── admin.tsx       # Protected admin layout
```

### Key Files

#### `app/lib/csrf.ts`

Utility for extracting CSRF tokens from cookies:

```typescript
export function getXsrfTokenFromCookie(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
```

#### `app/routes/login.tsx`

Handles the login form and authentication:

```typescript
export async function clientAction({ request }: Route.ClientActionArgs) {
  const fd = await request.formData();
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");

  try {
    await api("/sanctum/csrf-cookie", { method: "GET" });
    await apiHelpers.post("/login", { email, password }, {
      includeCSRF: true
    });
    return redirect("/admin");
  } catch (error) {
    return { error: error.message };
  }
}
```

#### `app/routes/admin.tsx`

Protected layout that checks authentication:

```typescript
export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch (error) {
    throw redirect("/admin/login");
  }
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

To implement logout, add a form action:

```typescript
export async function logoutAction() {
  try {
    await apiHelpers.post("/logout", {}, {
      requiresAuth: true,
      includeCSRF: true
    });
    return redirect("/admin/login");
  } catch (error) {
    return redirect("/admin/login"); // Redirect anyway
  }
}
```

And include it in your UI:

```typescript
<form method="post" action="/logout">
  <button type="submit">Log out</button>
</form>
```

## Environment Setup

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
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

// Log API responses
const response = await api("/api/user");
console.log("Auth check status:", response.status);
```