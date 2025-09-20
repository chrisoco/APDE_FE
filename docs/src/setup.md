# React Setup Dokumentation

Diese Dokumentation beschreibt das vollständige React-Anwendungssetup und die Konfiguration für das APDE Frontend-Projekt.

## Überblick

Dies ist eine moderne React-Anwendung, die mit React Router v7, TypeScript, Tailwind CSS und shadcn/ui-Komponenten erstellt wurde. Die Anwendung ist als Single Page Application (SPA) konfiguriert, wobei das serverseitige Rendering deaktiviert ist.

## Tech Stack

- **React**: v19.1.0 mit React DOM
- **React Router**: v7.7.1 (mit @react-router/dev, @react-router/node, @react-router/serve)
- **TypeScript**: v5.8.3 mit aktiviertem strict-Modus
- **Tailwind CSS**: v4.1.4 mit @tailwindcss/vite Plugin
- **Vite**: v6.3.3 als Build-Tool und Dev-Server
- **shadcn/ui**: Komponentenbibliothek mit Radix UI Primitives
- **ESLint**: v9.33.0 mit TypeScript und React Plugins

## Projektstruktur

```
apde_fe/
├── app/                  # Anwendungsquellcode
│   ├── root.tsx          # Root-Layout und Error Boundary
│   ├── app.css           # Globale Styles und Tailwind-Imports
│   ├── routes.ts         # React Routes
│   ├── routes/           # React Views
│   ├── components/       # Komponenten
│   ├── ui/               # shadcn/ui Komponenten
│   ├── lib/              # Hilfsfunktionen
│   └── hooks/            # Benutzerdefinierte React Hooks
├── docs/                 # Dokumentation
└── build/                # Produktions-Build-Output
```

## React Router Konfiguration

### SPA-Modus Setup
Die Anwendung ist als Single Page Application in `react-router.config.ts` konfiguriert:

```typescript
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,  // Deaktiviert Server-Side Rendering für SPA-Modus
} satisfies Config;
```

### Root Layout (`app/root.tsx`)
- Stellt globales Layout mit HTML-Struktur bereit
- Enthält Error Boundary für elegante Fehlerbehandlung
- Integriert Toaster-Komponente für Benachrichtigungen
- Implementiert HydrateFallback mit Ladespinner
- Richtet Google Fonts (Inter) Preloading ein

### Skripte und Befehle
```json
{
  "dev": "react-router dev",
  "build": "react-router build",
  "start": "react-router-serve ./build/server/index.js"
}
```

## TypeScript Konfiguration

### Compiler-Optionen (`tsconfig.json`)
- **Target**: ES2022 mit moderner Modulauflösung
- **JSX**: react-jsx (automatische JSX-Transformation)
- **Modulsystem**: ES2022 mit Bundler-Auflösung
- **Pfad-Mapping**: `~/*` wird auf `./app/*` gemappt
- **Strict-Modus**: Aktiviert für Typsicherheit
- **Include-Pfade**: Unterstützt `.server` und `.client` Verzeichnisse

### Typgenerierung
Führe `react-router typegen && tsc` für Typprüfung und Route-Typgenerierung aus.

## ESLint Konfiguration

### Setup (`eslint.config.ts`)
- **Basis**: @eslint/js empfohlen + TypeScript ESLint + React Plugin
- **Umgebung**: Browser + Node.js Globals
- **Dateitypen**: .js, .mjs, .cjs, .ts, .mts, .cts, .jsx, .tsx
- **Ignoriert**: build/, .react-router/, dist/, node_modules/, Konfigurationsdateien

### Benutzerdefinierte Regeln
```typescript
{
  "react/no-unescaped-entities": "off",
  "react/react-in-jsx-scope": "off",        // Nicht nötig mit automatischem JSX
  "react/prop-types": "off",                // Verwendet TypeScript stattdessen
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  "@typescript-eslint/no-explicit-any": "warn",
  "no-empty": "warn",
  "no-empty-pattern": "warn"
}
```

## Tailwind CSS Setup

### Konfiguration
- **Version**: Tailwind CSS v4.1.4 mit @tailwindcss/vite Plugin
- **Import**: Verwendet `@import "tailwindcss"` in `app/app.css`
- **CSS-Variablen**: Aktiviert für Theme-Anpassung
- **Benutzerdefinierte Varianten**: Dark Mode mit `@custom-variant dark (&:is(.dark *))`

### Theme-System
- **Schrift**: Inter als primäre Schriftfamilie
- **Farben**: OKLCH-Farbraum für bessere Farbkonsistenz
- **Radius**: Konfigurierbares Border-Radius-System
- **Dark Mode**: Vollständige Dark-Theme-Unterstützung
- **Diagramme**: 5 vordefinierte Diagrammfarben
- **Sidebar**: Dediziertes Sidebar-Farbschema

### CSS-Struktur
```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
@theme { /* Schrift und Basis-Theme */ }
:root { /* Light-Theme-Variablen */ }
.dark { /* Dark-Theme-Variablen */ }
@layer base { /* Basis-Styles */ }
```

## shadcn/ui Konfiguration

### Setup (`components.json`)
```json
{
  "style": "new-york",           # Design-Variante
  "rsc": false,                  # Verwendet keine React Server Components
  "tsx": true,                   # TypeScript-Unterstützung
  "tailwind": {
    "css": "app/app.css",        # CSS-Datei-Speicherort
    "baseColor": "neutral",      # Basis-Farbpalette
    "cssVariables": true,        # Verwendet CSS-Variablen
    "prefix": ""                 # Kein Klassen-Präfix
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils",
    "ui": "~/components/ui",
    "lib": "~/lib",
    "hooks": "~/hooks"
  },
  "iconLibrary": "lucide"        # Icon-Bibliothek
}
```

### Verfügbare Komponenten
- **Radix UI Primitives**: Avatar, Checkbox, Dialog, Dropdown Menu, Label, Popover, Select, Separator, Slider, Slot, Tooltip
- **Zusätzlich**: Command Palette (cmdk), Day Picker, Sonner Toasts
- **Daten**: TanStack Table für Datentabellen
- **Diagramme**: Recharts-Integration
- **Themes**: next-themes für Dark Mode

## Vite Konfiguration

### Build-Setup (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [
    tailwindcss(),              # Tailwind CSS Integration
    reactRouter(),              # React Router Plugin
    tsconfigPaths(),           # TypeScript Pfad-Mapping
    compression({              # Gzip-Komprimierung
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    compression({              # Brotli-Komprimierung
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    })
  ],
  build: {
    minify: 'terser',          # Produktions-Minifizierung
    target: 'es2022',          # Build-Ziel
    sourcemap: false           # Sourcemaps in Produktion deaktiviert
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
});
```

## Entwicklungsworkflow

### Verfügbare Skripte
```bash
npm run dev        # Entwicklungsserver starten
npm run build      # Für Produktion bauen
npm run typecheck  # TypeScript-Typprüfung ausführen
npm run lint       # ESLint ausführen
npm run lint:fix   # ESLint-Probleme automatisch beheben
npm run knip       # Ungenutzte Abhängigkeiten finden
npm run fix        # typecheck + lint:fix + knip ausführen
```

### Pfad-Aliase
- `~/components` → `./app/components`
- `~/lib` → `./app/lib`
- `~/hooks` → `./app/hooks`
- `~/*` → `./app/*`

## Performance-Optimierungen

1. **Komprimierung**: Gzip- und Brotli-Komprimierung aktiviert
2. **Minifizierung**: Terser für JavaScript-Minifizierung
3. **Schrift-Laden**: Preconnect und Preload für Google Fonts
4. **Caching**: Langzeit-Caching-Header für statische Assets
5. **Code-Splitting**: Automatisch mit React Router und Vite
6. **HydrateFallback**: Ladespinner während Client-Hydration

## Best Practices

1. **Typsicherheit**: Strikte TypeScript-Konfiguration mit Route-Typgenerierung
2. **Code-Qualität**: ESLint mit React- und TypeScript-Regeln
3. **Barrierefreiheit**: Eingebaut mit Radix UI Primitives
4. **Styling**: Konsistentes Design-System mit Tailwind und shadcn/ui
5. **Fehlerbehandlung**: Globale Error Boundary im Root-Layout
6. **Performance**: Optimierte Build-Konfiguration und Komprimierung