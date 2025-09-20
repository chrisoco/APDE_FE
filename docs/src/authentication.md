# Authentifizierungs-Ablauf Dokumentation

Diese Anwendung verwendet Laravel Sanctum für SPA (Single Page Application) Authentifizierung mit Cookie-basierter Session-Verwaltung und React Router v7 für clientseitige Authentifizierungslogik.

## Überblick

Das Authentifizierungssystem besteht aus:
- **Frontend**: React Router v7 mit `clientLoader()` und `clientAction()` für Route-basierte Auth-Logik
- **Backend**: Laravel Sanctum für API-Authentifizierung
- **Session-Verwaltung**: HTTP-only Cookies für sichere Token-Speicherung
- **CSRF-Schutz**: XSRF-Token für zustandsändernde Operationen
- **Zustandsverwaltung**: Cookie-basierte Authentifizierungszustandsprüfung
- **UI-Komponenten**: Getrennte, wiederverwendbare Form-Komponenten

## React Router v7 Authentifizierungs-Architektur

### Datei-Architektur Überblick

```
app/
├── routes/
│   ├── login.tsx                 # Route-Handler mit clientLoader/clientAction
│   └── admin/
│       └── _layout.tsx           # Geschütztes Layout mit Auth-Überprüfung
├── components/
│   ├── login-form.tsx            # UI-Komponente für Anmeldeformular
│   ├── app-sidebar.tsx           # Navigation mit Benutzer-Info
│   └── nav-user.tsx              # Benutzer-Dropdown mit Abmeldung
└── lib/
    ├── api.ts                    # API-Wrapper mit Auth-Behandlung
    └── csrf.ts                   # CSRF-Token-Hilfsprogramme
```

### **Separation of Concerns Prinzip**

#### **Route-Handler** (`app/routes/login.tsx`)
- **Verantwortung**: Datenladung, Aktionen, Business-Logik
- **Funktionen**: `clientLoader()`, `clientAction()`, Redirects
- **Zweck**: Server-Client-Kommunikation und Routing-Logik

#### **UI-Komponente** (`app/components/login-form.tsx`)
- **Verantwortung**: Formular-Rendering, Benutzereingaben, UI-State
- **Funktionen**: Form-Validation, Loading-States, Error-Display
- **Zweck**: Wiederverwendbare UI-Logik ohne Business-Logik

## Authentifizierungsablauf

### 1. Anmeldeprozess - Route-Level (`app/routes/login.tsx`)

#### `clientLoader()` - Authentifizierungs-Überprüfung vor Render

```typescript
export async function clientLoader() {
    // Schritt 1: Cookie-basierte Vorab-Prüfung
    if (hasAuthCookies()) {
        try {
            // Schritt 2: Validierung beim Backend
            const response = await api("/api/user", { method: "GET" });
            if (response.ok) {
                // Benutzer ist bereits authentifiziert - Weiterleitung
                throw redirect("/admin");
            }
            // Response nicht OK (401, 403, etc.) - Benutzer nicht authentifiziert
            // Bleibe auf Login-Seite
        } catch (error) {
            // Schritt 3: Redirect-Response-Handling
            if (error instanceof Response && error.status !== 401) {
                throw error; // Propagiere Redirect-Responses
            }
            // API-Aufruf fehlgeschlagen - Benutzer nicht authentifiziert
        }
    }
    // Kein Auth-Cookie oder ungültig - zeige Login-Formular
    return null;
}
```

**`clientLoader()` Ablauf-Logik:**
1. **Cookie-Check**: `hasAuthCookies()` überprüft XSRF-TOKEN-Existenz
2. **Backend-Validierung**: `/api/user` GET-Request zur Session-Validierung
3. **Redirect-Logik**: Bei erfolgreicher Auth → `/admin`, sonst Login-Form anzeigen
4. **Error-Handling**: Unterscheidung zwischen Redirects und Auth-Fehlern

#### `clientAction()` - Anmelde-Formular-Verarbeitung

```typescript
export async function clientAction({ request }: ClientActionFunctionArgs) {
  // Schritt 1: Form-Daten extrahieren
  const fd = await request.formData();
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");

  try {
    // Schritt 2: CSRF-Cookie holen (Laravel Sanctum Requirement)
    await api("/sanctum/csrf-cookie", { method: "GET" });

    // Schritt 3: Login-Request mit CSRF-Token
    await apiHelpers.post("/login", { email, password }, { includeCSRF: true });

    // Schritt 4: Erfolgreiche Anmeldung - Redirect zu Admin
    return redirect("/admin");
  } catch (error) {
    // Schritt 5: Fehlerbehandlung und Parsing
    let message = "Login failed";
    if (error instanceof Error && error.message.includes("API Error:")) {
      try {
        const errorMessage = error.message.split("API Error: ")[1];
        const data = JSON.parse(errorMessage.split(" ").slice(1).join(" "));
        if (data?.message) message = data.message;
      } catch (parseError) {
        console.debug('Fehler beim Parsen der Fehlermeldung als JSON:', parseError);
      }
    }
    // Rückgabe der Fehlerdaten für UI-Anzeige
    return { error: message };
  }
}
```

#### Login-Route-Komponente

```typescript
export default function Login() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      <div className="relative w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
```

**Rolle der Route-Komponente:**
- **Layout**: Globale Styling und Positionierung
- **Container**: Wrapper für die Login-Form-Komponente
- **Koordination**: Verbindung zwischen Route-Handlern und UI-Komponenten

### 2. Login-Form-Komponente (`app/components/login-form.tsx`)

#### React Router v7 Hooks Integration

```typescript
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  // Hook 1: Action-Daten für Fehleranzeige
  const actionData = useActionData() as { error?: string } | undefined

  // Hook 2: Navigation-State für Loading-Indication
  const nav = useNavigation()
  const busy = nav.state === "submitting"

  // Hook 3: Lokaler Form-State
  const [email, setEmail] = useState("john@doe.com")  // Dev-Default
  const [password, setPassword] = useState("1234")     // Dev-Default

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* React Router Form - submitted zu clientAction */}
          <Form method="post" className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Titel und Beschreibung */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your APDE account
                </p>
              </div>

              {/* Email-Feld */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"                    // Form-Name für clientAction
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password-Feld */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"                 // Form-Name für clientAction
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Fehleranzeige von clientAction */}
              {actionData?.error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {actionData.error}
                </div>
              )}

              {/* Submit-Button mit Loading-State */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-semibold shadow-sm hover:shadow-md border border-blue-200 hover:border-blue-300 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  disabled={busy}
                >
                  {busy ? "Signing in..." : "Login"}
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">← Back to Home</Link>
                </Button>
              </div>

              {/* Social Login Optionen */}
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Apple, Google, Meta Login Buttons */}
              </div>
            </div>
          </Form>

          {/* Rechte Seite: Marketing-Content */}
          <div className="relative hidden md:block bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
            <div className="relative flex h-full items-center justify-center p-8">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Welcome to APDE</h2>
                <p className="text-white/90 text-lg mb-6">Your powerful web campaign management platform</p>
                <div className="space-y-3 text-white/80 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <span>Advanced Campaign Analytics</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>Landing Page Builder</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>Email Campaign Automation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms und Privacy Links */}
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>.
      </div>
    </div>
  )
}
```

### 3. Geschützte Routen - Admin Layout (`app/routes/admin/_layout.tsx`)

#### `clientLoader()` für Route-Schutz

```typescript
export async function clientLoader() {
  try {
    // Authentifizierte API-Anfrage zur User-Daten-Abfrage
    const user = await apiHelpers.get("/api/user");
    return { user };  // User-Daten für Layout verfügbar machen
  } catch {
    // Bei Fehler (401, Network, etc.) → Login-Redirect
    throw redirect("/admin/login");
  }
}
```

**Layout-Loader-Funktionen:**
- **Auth-Gate**: Überprüft Authentifizierung vor jedem Admin-Seitenaufruf
- **User-Daten**: Lädt aktuelle Benutzerdaten für Layout-Anzeige
- **Automatic-Redirect**: Leitet nicht-authentifizierte Benutzer weiter

#### `clientAction()` für Abmeldung

```typescript
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    try {
      // Backend-Logout (Session invalidieren)
      await apiHelpers.post("/logout", {}, {
        requiresAuth: true,
        includeCSRF: true
      });
    } catch (error) {
      // Auch bei Logout-Fehler: Client-Cleanup und Redirect
      console.warn("Abmeldung fehlgeschlagen:", error);
    }

    // Client-seitige Auth-Cookies löschen
    clearAuthCookies();
    return redirect("/admin/login");
  }

  return null;
}
```

### 4. React Router v7 Hook-Integration

#### `useActionData()` - Daten aus Actions abrufen

```typescript
// In login-form.tsx
const actionData = useActionData() as { error?: string } | undefined

// Verwendung:
{actionData?.error && (
  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
    {actionData.error}
  </div>
)}
```

#### `useNavigation()` - Loading-States verwalten

```typescript
// In login-form.tsx
const nav = useNavigation()
const busy = nav.state === "submitting"

// Verwendung:
<Button type="submit" disabled={busy}>
  {busy ? "Signing in..." : "Login"}
</Button>
```

#### `useLoaderData()` - Daten aus Loaders abrufen

```typescript
// In admin/_layout.tsx
export default function AdminLayout() {
  const { user } = useLoaderData<typeof clientLoader>();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      {/* Layout-Content */}
    </SidebarProvider>
  );
}
```

## CSRF-Token-Management (`app/lib/csrf.ts`)

### Implementierung

```typescript
export function getXsrfTokenFromCookie(): string | null {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
}

export function hasAuthCookies(): boolean {
    // Überprüfen, ob XSRF-Token vorhanden - Indikator für Auth-Flow
    return getXsrfTokenFromCookie() !== null;
}

export function clearAuthCookies(): void {
    // XSRF-Token-Cookie löschen
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/; SameSite=lax';
}
```

### Integration in Login-Flow

1. **Pre-Auth-Check**: `hasAuthCookies()` in `clientLoader()`
2. **CSRF-Abruf**: `/sanctum/csrf-cookie` vor Login-Request
3. **Token-Inclusion**: `includeCSRF: true` in `apiHelpers.post()`
4. **Cleanup**: `clearAuthCookies()` bei Logout

## Benutzernavigation und Abmeldung

### NavUser-Komponente (`app/components/nav-user.tsx`)

```typescript
export function NavUser({ user }: { user: { name: string; email: string; avatar: string } }) {
  const { isMobile } = useSidebar()
  const fetcher = useFetcher()  // React Router Form-Fetcher

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            {/* User-Info-Header */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Account-Optionen */}
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* Logout-Button */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full"
                onClick={() => {
                  fetcher.submit(
                    { intent: "logout" },                    // Form-Data
                    { method: "post", action: "/admin" }     // Target clientAction
                  )
                }}
              >
                <LogOut />Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

**Logout-Mechanismus:**
1. **Button-Click**: Triggert `fetcher.submit()`
2. **Form-Submission**: Sendet `{ intent: "logout" }` zu `/admin` Route
3. **clientAction**: Admin-Layout-Action verarbeitet Intent
4. **Backend-Logout**: API-Aufruf zum Session-Invalidieren
5. **Client-Cleanup**: `clearAuthCookies()` entfernt lokale Tokens
6. **Redirect**: Automatische Weiterleitung zu `/admin/login`

## Sicherheitsüberlegungen

### CSRF-Schutz

```typescript
// 1. Cookie-Abruf vor Authentication
await api("/sanctum/csrf-cookie", { method: "GET" });

// 2. Token-Inclusion in Request
await apiHelpers.post("/login", { email, password }, { includeCSRF: true });

// 3. Automatische Header-Injection im API-Wrapper
if (includeCSRF) {
  const xsrfToken = getXsrfTokenFromCookie();
  if (xsrfToken) {
    (headers as any)["X-XSRF-TOKEN"] = xsrfToken;
  }
}
```

### Automatische Redirects

```typescript
// Bei 401-Responses mit requiresAuth
if (requiresAuth && !response.ok && response.status === 401) {
  window.location.href = "/admin/login";
  throw new Error("Authentication required");
}
```

### Cookie-Sicherheit

**Backend-Konfiguration (Laravel):**
```php
'same_site' => 'lax',
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,
```

## Moderne React Router v7 Vorteile

### **Route-basierte Datenladung**
- **Parallel Loading**: Loader und Komponente parallel
- **Race Condition Prevention**: Automatische Request-Deduplication
- **Error Boundaries**: Integrierte Fehlerbehandlung
- **Optimistic UI**: Sofortige Navigation mit späteren Updates

### **Type Safety**
```typescript
// Vollständige Typisierung von Loader-Daten
const user = useLoaderData<typeof clientLoader>();  // TypeScript inferiert User-Type
```

### **Server-Client Coordination**
- **Form-Revalidation**: Automatische Daten-Updates nach Actions
- **Progressive Enhancement**: Funktioniert ohne JavaScript
- **State Coordination**: Sync zwischen Server-State und Client-State

Diese Architektur bietet eine robuste, typisierte und performante Grundlage für Authentifizierung mit modernen React-Patterns und optimaler User Experience.