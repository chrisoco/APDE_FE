# API Wrapper Dokumentation

Der API Wrapper (`app/lib/api.ts`) bietet eine zentrale Methode zur Behandlung von HTTP-Anfragen an Ihre Backend-API mit konsistenter Konfiguration und Fehlerbehandlung.

## Überblick

Der API-Wrapper abstrahiert die native `fetch`-API und bietet:
- **Automatische URL-Konfiguration**: Basis-URL aus Umgebungsvariablen
- **Konsistente Header**: JSON-Content-Type und Accept-Header
- **CSRF-Schutz**: Automatische XSRF-Token-Behandlung
- **Authentifizierung**: Automatische Weiterleitung bei 401-Fehlern
- **Query-Parameter**: Erweiterte Unterstützung für Arrays und primitive Typen
- **Paginierung**: Intelligente Auto-Fetch-Funktionalität für alle Seiten
- **TypeScript**: Vollständige Typsicherheit mit Generics

## Konfiguration

### Umgebungsvariablen

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
```

Der Wrapper konfiguriert automatisch:
- **Basis-URL**: Aus `VITE_API_URL` Umgebungsvariable (Standard: `http://localhost:8000`)
- **Credentials**: `"include"` für Cookie-basierte Authentifizierung
- **JSON-Header**: Automatisch gesetzt für `Accept` und `Content-Type`
- **CSRF-Token-Behandlung**: Für Laravel Sanctum optimiert

### Standard-Header

```typescript
const headers: HeadersInit = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  ...fetchOptions.headers,
};
```

## Kern-Interfaces und Typen

### ApiOptions Interface

```typescript
interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;     // Auto-Weiterleitung zu /admin/login bei 401
  includeCSRF?: boolean;      // XSRF-Token-Header einbeziehen
  params?: Record<string, string | number | boolean | string[]>; // Query-Parameter
}
```

### PaginationOptions Interface

```typescript
interface PaginationOptions {
  page?: number;      // Seitennummer (Standard: 1)
  per_page?: number;  // Elemente pro Seite (Standard: 10)
}
```

## Kern-Funktionen

### `api(endpoint, options)` - Basis-Funktion

Die grundlegende Funktion, die alle anderen Wrapper-Funktionen verwenden:

```typescript
export async function api(endpoint: string, options: ApiOptions = {}): Promise<Response>
```

**Parameter:**
- `endpoint`: API-Endpunkt (relativ oder absolut)
- `options`: Erweiterte RequestInit-Optionen mit zusätzlichen Eigenschaften

**Funktionalität:**
1. **URL-Aufbau**: Kombiniert Basis-URL mit Endpunkt
2. **Query-Parameter-Verarbeitung**: Konvertiert Objects zu URLSearchParams
3. **Array-Parameter-Unterstützung**: Spezielle Behandlung für Array-Werte
4. **Header-Konfiguration**: Setzt Standard-JSON-Header
5. **CSRF-Token-Integration**: Fügt X-XSRF-TOKEN hinzu wenn `includeCSRF: true`
6. **Authentifizierung**: Automatische Weiterleitung bei 401 und `requiresAuth: true`

#### URL und Query-Parameter-Verarbeitung

```typescript
// URL-Aufbau
let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

// Query-Parameter-Verarbeitung
if (params) {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Array-Werte: key=val1&key=val2
      value.forEach(item => {
        urlParams.append(key, String(item));
      });
    } else {
      // Primitive Werte: key=value
      urlParams.append(key, String(value));
    }
  });
  url += `${url.includes('?') ? '&' : '?'}${urlParams.toString()}`;
}
```

#### CSRF-Token-Behandlung

```typescript
if (includeCSRF) {
  const xsrfToken = getXsrfTokenFromCookie();
  if (xsrfToken) {
    (headers as any)["X-XSRF-TOKEN"] = xsrfToken;
  }
}
```

#### Authentifizierungs-Weiterleitung

```typescript
if (requiresAuth && !response.ok && response.status === 401) {
  window.location.href = "/admin/login";
  throw new Error("Authentication required");
}
```

### `apiJson<T>(endpoint, options)` - JSON-Response-Handler

```typescript
async function apiJson<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T>
```

**Funktionalität:**
1. Ruft `api()` auf
2. Überprüft Response-Status
3. Konvertiert Response zu JSON
4. Wirft strukturierte Fehler bei Problemen

**Fehlerbehandlung:**
```typescript
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`API Error: ${response.status} ${errorText}`);
}
```

## API Helper-Methoden

Der `apiHelpers`-Export bietet praktische Wrapper für häufige HTTP-Methoden:

### GET-Anfragen

```typescript
get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
  apiJson<T>(endpoint, { ...options, method: 'GET' })
```

**Verwendungsbeispiele:**

```typescript
// Einfache GET-Anfrage
const user = await apiHelpers.get<User>("/api/user");

// GET mit Authentifizierung
const protectedData = await apiHelpers.get("/api/protected", {
  requiresAuth: true
});

// GET mit einfachen Query-Parametern
const filtered = await apiHelpers.get("/api/users", {
  params: {
    status: "active",
    role: "admin",
    page: 1,
    limit: 50
  }
});

// GET mit Array-Parametern für Multi-Select-Filter
const campaigns = await apiHelpers.get("/api/campaigns", {
  params: {
    status: ["active", "draft", "completed"],
    categories: ["email", "social", "content"],
    tags: ["urgent", "newsletter"]
  }
});
// Erzeugt: ?status=active&status=draft&status=completed&categories=email&categories=social&categories=content&tags=urgent&tags=newsletter
```

### POST-Anfragen

```typescript
post: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiJson<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
```

**Verwendungsbeispiele:**

```typescript
// POST mit JSON-Daten
const newUser = await apiHelpers.post<User>("/api/users", {
  name: "John Doe",
  email: "john@example.com",
  role: "admin"
});

// POST mit CSRF-Token (für Authentifizierungs-Endpunkte)
await apiHelpers.post("/login", { email, password }, {
  includeCSRF: true
});

// POST mit Authentifizierung und CSRF
const campaign = await apiHelpers.post("/api/campaigns", {
  title: "Neue Kampagne",
  description: "Beschreibung",
  status: "draft"
}, {
  requiresAuth: true,
  includeCSRF: true
});
```

### PUT-Anfragen

```typescript
put: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiJson<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
```

**Verwendungsbeispiele:**

```typescript
// PUT für vollständige Ressourcen-Updates
const updatedUser = await apiHelpers.put<User>(`/api/users/${id}`, {
  name: "Jane Doe",
  email: "jane@example.com",
  role: "editor"
}, {
  requiresAuth: true,
  includeCSRF: true
});

// PUT ohne Body für Aktions-Endpunkte
await apiHelpers.put(`/api/campaigns/${id}/activate`, undefined, {
  requiresAuth: true,
  includeCSRF: true
});
```

### DELETE-Anfragen

```typescript
delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
  apiJson<T>(endpoint, { ...options, method: 'DELETE' })
```

**Verwendungsbeispiele:**

```typescript
// Einfaches DELETE
await apiHelpers.delete(`/api/users/${id}`, {
  requiresAuth: true,
  includeCSRF: true
});

// DELETE mit Response-Daten
const deleteResult = await apiHelpers.delete<{deleted: boolean, message: string}>(`/api/campaigns/${id}`, {
  requiresAuth: true,
  includeCSRF: true
});
```

## Paginierte Anfragen - Detaillierte Implementierung

### `paginated<T>(endpoint, pagination, options)` - Auto-Fetch-Alle-Seiten

```typescript
paginated: async <T = any>(
  endpoint: string,
  pagination: PaginationOptions = {},
  options?: Omit<ApiOptions, 'method'>
): Promise<T>
```

**Algorithmus-Überblick:**

1. **Erste Anfrage**: Holt Seite 1 mit angegebener `per_page`
2. **Meta-Daten-Analyse**: Überprüft `total`, `last_page`, `per_page` in Response
3. **Mehrseiten-Erkennung**: Wenn `total > per_page` und `last_page > 1`
4. **Parallele Anfragen**: Erstellt Promises für Seiten 2 bis `last_page`
5. **Promise.all()**: Führt alle verbleibenden Anfragen parallel aus
6. **Daten-Kombination**: Vereint alle `data`-Arrays zu einem
7. **Meta-Update**: Aktualisiert `current_page: 1` und `per_page: allData.length`

### Schritt-für-Schritt-Implementierung

#### 1. Erste Anfrage und Parameter-Verarbeitung

```typescript
const { page = 1, per_page = 10 } = pagination;

// Erste Anfrage mit kombinierten Parametern
const firstResponse = await apiJson<T>(endpoint, {
  ...options,
  method: 'GET',
  params: {
    page,
    per_page,
    ...options?.params  // Erhält zusätzliche Filter-Parameter
  }
});
```

#### 2. Paginierungs-Erkennung

```typescript
// Überprüfung auf Laravel-Standard-Paginierung
if (
  firstResponse &&
  typeof firstResponse === 'object' &&
  'meta' in firstResponse &&
  'data' in firstResponse
) {
  const paginatedResponse = firstResponse as any;
  const { total, per_page: actualPerPage, last_page } = paginatedResponse.meta;

  // Mehrseiten-Logik nur wenn nötig
  if (total > actualPerPage && last_page > 1) {
    // Auto-Fetch-Logik
  }
}
```

#### 3. Parallele Seiten-Anfragen

```typescript
const allData = [...paginatedResponse.data];
const promises = [];

// Erstelle Promises für alle verbleibenden Seiten
for (let currentPage = 2; currentPage <= last_page; currentPage++) {
  promises.push(
    apiJson<T>(endpoint, {
      ...options,
      method: 'GET',
      params: {
        page: currentPage,
        per_page: actualPerPage,  // Verwendet tatsächliche per_page aus Response
        ...options?.params        // Erhält Filter von ursprünglicher Anfrage
      }
    })
  );
}
```

#### 4. Parallele Ausführung und Daten-Kombination

```typescript
// Alle Anfragen parallel ausführen
const remainingResponses = await Promise.all(promises);

// Alle Daten-Arrays kombinieren
remainingResponses.forEach(response => {
  if (response && typeof response === 'object' && 'data' in response) {
    allData.push(...(response as any).data);
  }
});
```

#### 5. Response-Aufbau mit aktualisierten Meta-Daten

```typescript
return {
  ...paginatedResponse,
  data: allData,
  meta: {
    ...paginatedResponse.meta,
    current_page: 1,                // Zurückgesetzt auf 1
    per_page: allData.length        // Tatsächliche Anzahl aller Elemente
  }
} as T;
```

### Paginierungs-Szenarien

#### Szenario 1: Einzelne Seite
```typescript
// API Response: { data: [1,2,3], meta: { total: 3, per_page: 10, last_page: 1 } }
const result = await apiHelpers.paginated('/api/items', { per_page: 10 });
// Ergebnis: Ursprüngliche Response (1 Anfrage)
```

#### Szenario 2: Mehrere Seiten
```typescript
// API Response: { data: [1,2], meta: { total: 7, per_page: 2, last_page: 4 } }
const result = await apiHelpers.paginated('/api/items', { per_page: 2 });
// Ergebnis: { data: [1,2,3,4,5,6,7], meta: { total: 7, per_page: 7, current_page: 1, last_page: 4 } }
// Anfragen: 4 parallele Requests (Seiten 1,2,3,4)
```

#### Szenario 3: Mit Filter-Parametern
```typescript
const result = await apiHelpers.paginated('/api/campaigns',
  { per_page: 50 },
  {
    requiresAuth: true,
    params: {
      status: ["active", "draft"],
      category: "email"
    }
  }
);
// Alle Seiten-Anfragen erhalten dieselben Filter-Parameter
```

## Query-Parameter-Verarbeitung im Detail

### Primitive Typen

```typescript
// Input
params: {
  name: "John",
  age: 25,
  active: true
}

// Output: ?name=John&age=25&active=true
```

### Array-Parameter

```typescript
// Input
params: {
  roles: ["admin", "editor"],
  tags: ["urgent", "newsletter", "campaign"]
}

// Output: ?roles=admin&roles=editor&tags=urgent&tags=newsletter&tags=campaign
```

**Backend-Kompatibilität:**
- **Laravel**: Automatisch als Array interpretiert
- **Express.js**: Verwendet `req.query.roles` als Array
- **Django**: `request.GET.getlist('roles')`

### Gemischte Parameter

```typescript
// Input
params: {
  search: "user search",
  page: 1,
  status: ["active", "pending"],
  sort: "created_at",
  order: "desc"
}

// Output: ?search=user+search&page=1&status=active&status=pending&sort=created_at&order=desc
```

## Erweiterte Konfiguration

### Custom Headers

```typescript
await apiHelpers.get('/api/data', {
  headers: {
    'Custom-Header': 'value',
    'Authorization': 'Bearer token'  // Überschreibt Standard-Auth
  }
});
```

### Absolute URLs

```typescript
// Ignoriert API_BASE_URL
await apiHelpers.get('https://external-api.com/endpoint');
```

### Request Timeout

```typescript
await apiHelpers.get('/api/data', {
  signal: AbortSignal.timeout(5000)  // 5 Sekunden Timeout
});
```

## Fehlerbehandlung im Detail

### HTTP-Status-Fehler

```typescript
// Bei nicht-erfolgreichen Responses
try {
  await apiHelpers.get('/api/nonexistent');
} catch (error) {
  // error.message: "API Error: 404 Not Found"
  console.log(error.message);
}
```

### Authentifizierungs-Fehler

```typescript
try {
  await apiHelpers.get('/api/protected', { requiresAuth: true });
} catch (error) {
  // Bei 401: Automatische Weiterleitung zu /admin/login
  // error.message: "Authentication required"
}
```

### Netzwerk-Fehler

```typescript
try {
  await apiHelpers.get('/api/data');
} catch (error) {
  if (error instanceof TypeError) {
    // Netzwerk-Connectivity-Probleme
    console.log('Netzwerkfehler:', error.message);
  }
}
```

### CSRF-Fehler

```typescript
try {
  await apiHelpers.post('/api/data', {}, { includeCSRF: true });
} catch (error) {
  // error.message: "API Error: 419 CSRF token mismatch"
  console.log('CSRF-Fehler:', error.message);
}
```

## Performance-Optimierungen

### 1. Parallele Paginierung

```typescript
// Automatisch parallel für große Datensätze
const campaigns = await apiHelpers.paginated('/api/campaigns', { per_page: 100 });
// Bei 1000 Elementen: 10 parallele Anfragen statt 10 sequenzielle
```

### 2. Parameter-Wiederverwendung

```typescript
// Filter werden an alle Seiten-Anfragen weitergegeben
const filtered = await apiHelpers.paginated('/api/data',
  { per_page: 50 },
  {
    params: {
      complex_filter: "value",
      date_range: ["2024-01-01", "2024-12-31"]
    }
  }
);
```

### 3. TypeScript-Optimierung

```typescript
// Vollständige Typisierung für bessere IDE-Unterstützung
interface CampaignResponse {
  data: Campaign[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const campaigns = await apiHelpers.paginated<CampaignResponse>('/api/campaigns');
// campaigns.data ist vollständig typisiert als Campaign[]
```

## Cache-Integration

Der API-Wrapper integriert sich nahtlos mit dem Cache-Manager:

### Basis-Caching

```typescript
import { withCache, CACHE_TAGS } from "~/lib/cache-manager";

const campaigns = await withCache(
  () => apiHelpers.paginated('/api/campaigns', { page: 1, per_page: 50 }, { requiresAuth: true }),
  CACHE_TAGS.CAMPAIGNS,
  { ttl: 2 * 60 * 1000 }
);
```

### Cache-Invalidierung bei Mutationen

```typescript
// Automatisch in useFormWithValidation und useAdminActions
if (cacheKey) {
  cacheManager.invalidate(cacheKey);
}
```

## Best Practices

### 1. TypeScript-Nutzung

```typescript
// ✅ Gut: Vollständige Typisierung
interface User {
  id: string;
  name: string;
  email: string;
}

const user = await apiHelpers.get<User>('/api/user');

// ❌ Schlecht: Untypisiert
const user = await apiHelpers.get('/api/user');
```

### 2. Fehlerbehandlung

```typescript
// ✅ Gut: Spezifische Fehlerbehandlung
try {
  const data = await apiHelpers.get('/api/data', { requiresAuth: true });
  return data;
} catch (error) {
  if (error.message.includes('API Error: 401')) {
    // Wird automatisch behandelt, aber für spezielle Logik
  }
  throw error; // Re-throw für höhere Ebenen
}
```

### 3. Parameter-Organisation

```typescript
// ✅ Gut: Strukturierte Parameter
const searchParams = {
  query: searchTerm,
  filters: {
    status: ["active", "draft"],
    category: selectedCategory
  },
  pagination: {
    page: 1,
    per_page: 50
  }
};

const results = await apiHelpers.get('/api/search', {
  params: {
    q: searchParams.query,
    ...searchParams.filters,
    ...searchParams.pagination
  }
});
```

### 4. Paginierung vs. Standard-GET

```typescript
// ✅ Für große Datensätze: Paginierung verwenden
const allCampaigns = await apiHelpers.paginated('/api/campaigns', { per_page: 100 });

// ✅ Für kleine Datensätze: Standard-GET
const settings = await apiHelpers.get('/api/settings');
```

## Debugging und Entwicklung

### Netzwerk-Debugging

```typescript
// Response-Details loggen
const response = await api('/api/data');
console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers.entries()));
console.log('Body:', await response.clone().text());
```

### Parameter-Debugging

```typescript
// URL-Aufbau überprüfen
const params = { status: ["active", "draft"], page: 1 };
const urlParams = new URLSearchParams();
Object.entries(params).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    value.forEach(item => urlParams.append(key, String(item)));
  } else {
    urlParams.append(key, String(value));
  }
});
console.log('Generated URL params:', urlParams.toString());
```

### Paginierungs-Debugging

```typescript
const paginatedResult = await apiHelpers.paginated('/api/data', { per_page: 10 });
console.log('Total requests made:', paginatedResult.meta.last_page);
console.log('Total items fetched:', paginatedResult.data.length);
console.log('Items per original page:', paginatedResult.meta.total / paginatedResult.meta.last_page);
```

Dieser umfassende API-Wrapper bietet eine robuste, typsichere und performante Grundlage für alle HTTP-Kommunikation in der Anwendung und abstrahiert komplexe Aspekte wie Paginierung, Authentifizierung und Fehlerbehandlung.