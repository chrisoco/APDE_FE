# Landing Page System

Ein dynamisches, sektionsbasiertes Landing Page System, das responsive, visuell ansprechende Kampagnenseiten mit flexiblen Inhaltslayouts und intelligenter Fallback-Behandlung für fehlende Daten erstellt.

## Übersicht

Das Landing Page System besteht aus drei Hauptkomponenten:
1. **Öffentliche Landing Page Route** (`/landingpage/{slug}`) - Die benutzerseitige Kampagnenseite
2. **Admin-Formular-Interface** - Zum Erstellen und Bearbeiten von Landing Pages mit Sektionen
3. **Dynamisches Sektions-Rendering** - Intelligentes Layout-System, das sich an verfügbare Inhalte anpasst

### Hauptfunktionen

- **Responsive Design**: Mobile-First-Layouts mit Desktop-Verbesserungen
- **Dynamische Sektions-Typen**: Hero, wechselnde Features, reine Bild-Sektionen
- **Intelligente Fallbacks**: Elegante Behandlung fehlender Bilder, Texte oder CTAs
- **SEO-freundlich**: Ordnungsgemäße Meta-Tags und semantische HTML-Struktur
- **Ladezustände**: Schöne Lade-Animationen und Fehlerbehandlung
- **Barrierefreiheit**: ARIA-Labels, Tastaturnavigation und ordnungsgemäße Kontraste

## Datenstruktur

### Landing Page Schema

```typescript
interface Landingpage {
  id: string
  title: string           // Used in footer and meta
  headline: string        // Main hero headline
  subline: string         // Hero description/subtitle  
  sections: LandingpageSection[]
}

interface LandingpageSection {
  text: string           // Markdown content (can be empty)
  image_url: string      // Image URL (can be empty)
  cta_text: string       // Call-to-action button text (can be empty)
  cta_url: string        // CTA destination URL (can be empty)
}
```

### Kampagnen-Integration

Landing Pages sind über das `PublicCampaignData` Interface mit Kampagnen verknüpft:

```typescript
interface PublicCampaignData {
  id: string
  title: string
  slug: string           // URL slug for routing
  description: string
  landingpage: Landingpage
}
```

## Sektions-Typen und Rendering

Das System rendert intelligent verschiedene Sektions-Layouts basierend auf Inhaltsverfügbarkeit und Sektions-Position:

### 1. Hero-Inhalts-Sektion (Erste Sektion)

**Eigenschaften:**
- Immer zentriertes Layout
- Größerer Bild-Container (max-height: 500px)
- Primäres CTA-Styling mit Verlauf und Animationen
- Größere Text-Behandlung

**Gerendert wenn:** `index === 0`

**Visuelle Elemente:**
- **Bild**: Zentriert mit dekorativem Hintergrund-Verlauf und Schatten
- **Text**: Prose-Styling mit Absatz-Umbrüchen, größere Schriftgröße
- **CTA**: Großer smaragdgrüner Verlaufs-Button mit Hover-Animationen

```typescript
// Hero section example
{
  text: "Welcome to our amazing campaign...\n\nDiscover the features that make us unique.",
  image_url: "https://example.com/hero.jpg", 
  cta_text: "Get Started Now",
  cta_url: "https://example.com/signup"
}
```

### 2. Wechselnde Feature-Sektionen (Mit Text)

**Eigenschaften:**
- Zweispaltiges Grid-Layout auf Desktop
- Wechselnde Links/Rechts-Bild-Platzierung
- Mittlere Bildgröße (max-height: 400px)
- Sekundäres CTA-Styling

**Gerendert wenn:** `index > 0 && section.text` (hat Text-Inhalt)

**Layout-Muster:**
- **Ungerade Sektionen** (index % 2 === 1): Bild rechts, Text links, rechtsbündig
- **Gerade Sektionen**: Bild links, Text rechts, linksbündig

**Visuelle Elemente:**
- **Bild**: Dekorative Rotations-Effekte, die sich bei Hover begradigen
- **Text**: Absatz-Umbrüche mit responsiver Ausrichtung
- **CTA**: Kleinere dunkelgraue Buttons mit externen Link-Icons

```typescript
// Feature section example
{
  text: "Our advanced analytics help you track performance.\n\nGet insights that matter.",
  image_url: "https://example.com/analytics.jpg",
  cta_text: "View Analytics", 
  cta_url: "https://example.com/analytics"
}
```

### 3. Reine Bild-Sektionen (Ohne Text)

**Eigenschaften:**
- Zentriertes Layout mit Fokus auf Bild
- Größerer Bild-Container (max-height: 600px)
- Erweiterte Hover-Effekte
- Primäres CTA-Styling

**Gerendert wenn:** `index > 0 && !section.text` (kein Text-Inhalt)

**Visuelle Elemente:**
- **Bild**: Zentriert mit Skalierungs-Hover-Effekten und Verlaufs-Hintergrund
- **CTA**: Primäres smaragdgrünes Button-Styling passend zur Hero-Sektion

```typescript
// Image-only section example  
{
  text: "",                    // Empty text triggers image-only layout
  image_url: "https://example.com/showcase.jpg",
  cta_text: "View Gallery",
  cta_url: "https://example.com/gallery"
}
```

## Fehlende Daten Behandlung

Das System behandelt fehlende oder leere Inhalte elegant mit intelligenten Fallbacks:

### Fehlende Bilder

**Verhalten:** Sektion wird weiterhin ohne Bild-Container gerendert
**Auswirkung:** Text nimmt volle Breite ein, behält ordnungsgemäße Abstände

```typescript
// Section with missing image
{
  text: "This section has no image but still displays content beautifully.",
  image_url: "",              // Empty image URL
  cta_text: "Learn More", 
  cta_url: "https://example.com"
}
```

**Ergebnis:** Inhalt fließt natürlich ohne kaputte Bild-Platzhalter

### Fehlender Text-Inhalt

**Verhalten:** Löst reinen Bild-Layout-Modus aus
**Auswirkung:** Bild wird zum Fokuspunkt mit verbessertem Styling

```typescript
// Section with missing text
{
  text: "",                   // Empty text triggers special layout
  image_url: "https://example.com/feature.jpg",
  cta_text: "Explore",
  cta_url: "https://example.com/explore"
}
```

**Ergebnis:** Zentriertes Bild mit prominentem CTA-Button darunter

### Fehlende CTA-Elemente

**Verhalten:** Sektion wird ohne Call-to-Action-Button gerendert
**Auswirkung:** Inhalt fließt natürlich ohne leeren Button-Platz

```typescript
// Section with no CTA
{
  text: "This is informational content without any call-to-action.",
  image_url: "https://example.com/info.jpg", 
  cta_text: "",               // Empty CTA text
  cta_url: ""                 // Empty CTA URL
}
```

**Ergebnis:** Saubere Inhalts-Präsentation fokussiert auf Informationsvermittlung

### Vollständige Sektions-Fallbacks

**Leere Sektionen:** Wenn alle Felder leer sind, wird die Sektion trotzdem mit ordnungsgemäßen Abständen gerendert
**Layout-Erhaltung:** Bewahrt visuellen Rhythmus und verhindert Layout-Kollaps

## Mobile Responsive Design

Das Landing Page System ist Mobile-First mit progressiver Verbesserung gebaut:

### Mobile Layout (< 768px)

**Hero-Sektion:**
```css
/* Mobile Hero-Anpassungen */
- Einspalten-Layout
- Reduziertes Padding: py-20 (anstatt py-28)
- Kleinere Überschrift: text-5xl (konsistent über Breakpoints)
- Bild über Text stapeln
- Vollbreite CTA-Buttons
```

**Feature-Sektionen:**
```css
/* Mobile Feature-Layout */
- Einspalten-Stapel (Grid deaktiviert)
- Bilder über Text-Inhalt
- Zentrierter Text (überschreibt lg:text-left/right)
- Vollbreite Bilder mit reduzierter Max-Höhe
- Touch-freundliche Button-Größen
```

**Bild-Behandlung:**
```css
/* Mobile Bild-Optimierungen */
- object-fit: cover erhält Seitenverhältnis
- Reduzierte Max-Höhen für bessere Bildschirm-Nutzung
- Erweiterte Touch-Ziele für interaktive Elemente
```

### Tablet Layout (768px - 1023px)

**Grid-System:**
```css
/* Tablet Grid-Verhalten */
- Zweispalten-Grid beginnt bei 768px (lg: Breakpoint)
- Bilder behalten wechselnde Positionen
- Text-Ausrichtung wechselt basierend auf Bild-Position
- Verbesserte Abstände zwischen Spalten (gap-16)
```

### Desktop Layout (1024px+)

**Erweiterte Funktionen:**
```css
/* Desktop-Verbesserungen */
- Vollständiges wechselndes Layout mit Rotationen
- Hover-Effekte auf Bilder (Skalierung, Rotation)
- Erweiterte Button-Animationen (-translate-y)
- Maximale Inhaltsbreiten-Beschränkungen (max-w-7xl)
```

### Touch- und Hover-Zustände

**Mobile-Überlegungen:**
- Hover-Effekte noch vorhanden, aber stören Touch nicht
- Touch-freundliche Button-Größen (Min-Höhe via Padding)
- Ordnungsgemäße Fokus-Zustände für Barrierefreiheit

**Interaktive Elemente:**
```css
/* Touch-freundliche Interaktionen */
- Button Min-Touch-Größe: 44px (via py-6 px-12)
- Bild-Hover-Zustände funktionieren bei Desktop-Hover
- Transform-Animationen für Mobile-Performance optimiert
```

## Lade- und Fehlerzustände

### Ladezustand

**Design:** Elegante Lade-Animation mit Markenfarben

```typescript
// Ladezustand-Funktionen
- Verlaufs-Hintergrund (slate-50 zu emerald-50 zu teal-100)
- Doppelring-Dreh-Animation mit smaragdgrünen Farben
- Animierter Text: "Loading your experience..."
- Drei-Punkt-Sprung-Animation mit gestaffelten Verzögerungen
- Konsistent mit Marken-Farbpalette
```

**Mobile-Anpassung:**
- Vollständige Viewport-Höhe (min-h-screen)
- Zentrierter Inhalt mit ordnungsgemäßem Padding
- Responsive Text-Größen

### Fehlerzustand

**Design:** Freundliche Fehlermeldung mit Wiederherstellungsoptionen

```typescript
// Fehlerzustand-Funktionen
- Warmer Verlaufs-Hintergrund (rose-50 zu amber-50)
- Warn-Icon in Rose-Farbschema
- Klare Fehlermeldungen mit Fallback-Text
- "Erneut versuchen" Button zur Wiederherstellung
- Alternative Vorschlags-Texte
```

**Fehlerbehandlung:**
- Netzwerk-Fehler: "Laden fehlgeschlagen. Bitte versuchen Sie es später erneut."
- Nicht gefunden: "Die gesuchte Kampagne konnte nicht gefunden werden"
- Generisches Fallback für unbekannte Fehler
- Neuladen-Funktionalität via window.location.reload()

## SEO und Barrierefreiheit

### Meta-Tags

```typescript
// Dynamic meta generation
export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Campaign Landing Page" },
    { name: "description", content: "View campaign details and landing page content" },
  ]
}
```

### Barrierefreiheits-Funktionen

**ARIA-Labels:**
```typescript
// CTA-Button-Barrierefreiheit
aria-label={`${section.cta_text} - ${data.title}`}
```

**Semantisches HTML:**
- Ordnungsgemäße Überschriften-Hierarchie (h1, h2)
- Semantisches Footer-Element
- Beschreibender Alt-Text für Bilder
- Ordnungsgemäße Link-Beziehungen (target="_blank" mit rel="noopener noreferrer")

**Fokus-Management:**
- Sichtbare Fokus-Zustände auf allen interaktiven Elementen
- Tastaturnavigation-Unterstützung
- Ordnungsgemäße Farb-Kontrast-Verhältnisse

## Performance Optimizations

### Image Handling

**Optimization Strategy:**
```css
/* Image performance */
- object-fit: cover prevents distortion
- max-height constraints prevent oversized images
- CSS transforms use GPU acceleration
- Lazy loading ready (can be added via loading="lazy")
```

**Responsive Images:**
- Single image URL with CSS-based responsive sizing
- max-height breakpoints for different screen sizes
- Proper aspect ratio maintenance

### CSS Animations

**Performance-Conscious Animations:**
```css
/* Optimized animations */
- transform and opacity changes (GPU accelerated)
- transition-all with duration controls
- hover effects that don't cause layout shifts
- will-change property could be added for complex animations
```

### Loading Performance

**Data Loading:**
```typescript
// Efficient data fetching
- Single API call with URL parameters
- Error boundary handling
- Proper loading state management
- No unnecessary re-renders during loading
```
## API-Integration

### Öffentlicher Kampagnen-Endpunkt

**Endpoint:** `GET /api/cp/{slug}`

**Parameter:**
- `slug`: Kampagnen-URL-Slug
- Query-Parameter, die über die URL weitergereicht werden

**Antwortformat:**
```typescript
interface PublicCampaignResponse {
  data: {
    id: string
    title: string
    slug: string
    description: string
    landingpage: {
      title: string
      headline: string
      subline: string
      sections: LandingpageSection[]
    }
  }
}
```

### URL-Parameter-Verarbeitung

Das Landingpage-System ist so konzipiert, dass alle Tracking-Parameter an das Backend weitergeleitet werden. Dadurch sind umfassende Analysen und ein detailliertes Prospect-Tracking zur Erfolgsmessung von Kampagnen möglich.

**Query-String-Unterstützung:**
```typescript
// URL-Parameter werden an die API weitergereicht
const queryString = searchParams.toString()
const url = queryString ? `/api/cp/${slug}?${queryString}` : `/api/cp/${slug}`
```

**Prospect-Tracking-Architektur:**

Das System unterstützt vollständige Workflows vom E-Mail-Versand bis zur Landingpage. Wenn Prospects Kampagnen-E-Mails erhalten, enthalten die CTA-Links Tracking-Parameter, die an das Backend weitergegeben und für Analysen verarbeitet werden.

**Standard-URL-Schema:**
```
{{URL}}/api/cp/{campaign-slug}?prospect={prospect-id}&utm_source={source}&utm_medium={medium}&utm_campaign={campaign-id}&utm_content={content}&utm_term={term}&gclid={google-click-id}&fbclid={facebook-click-id}
```

**Reales Beispiel:**
```
https://example.com/api/cp/reprehenderit-ut-optio-autem?prospect=68a36940d7f5370a25055570&utm_source=mail&utm_medium=web&utm_campaign=686a3affca7748f6b807cbec&utm_content=none&utm_term=none&gclid=12&fbclid=13
```

**Parameter-Kategorien:**

**1. Prospect-Identifikation:**
```typescript
prospect: "68a36940d7f5370a25055570"  // Eindeutige Prospect-ID
```
- Verknüpft E-Mail-Empfänger mit Landingpage-Besuch
- Ermöglicht Conversion-Tracking und Attribution
- Erlaubt Personalisierung basierend auf Prospect-Daten
- Unterstützt A/B-Testing und Segment-Analysen

**2. UTM-Kampagnen-Tracking:**
```typescript
utm_source: "mail"                      // Traffic-Quelle (mail, social, web, etc.)
utm_medium: "web"                       // Marketing-Medium (email, banner, link)  
utm_campaign: "686a3affca7748f6b807cbec" // Kampagnen-Identifier
utm_content: "none"                     // Anzeigeninhalt oder E-Mail-Variante
utm_term: "none"                        // Keyword-Begriffe (für Paid Search)
```
- Standard-Google-Analytics-Parameter
- Ermöglicht Kampagnen-Performance-Analyse
- Misst Effektivität im Conversion-Funnel
- Erfasst ROI über verschiedene Kanäle

**3. Plattform-spezifisches Tracking:**
```typescript
gclid: "12"                            // Google Ads Klick-ID  
fbclid: "13"                           // Facebook Ads Klick-ID
```
- Verknüpft Klicks mit spezifischen Werbekampagnen
- Ermöglicht plattformübergreifende Conversion-Attribution
- Unterstützt Zielgruppenbildung
- Erlaubt Retargeting und Lookalike Audiences

**Backend-Verarbeitung:**

Wenn das Frontend die API anfragt, werden alle Parameter ans Backend übermittelt, wo sie:

1. **Für Analysen gespeichert** werden: Herkunft, Kampagnen und Conversion-Pfade nachverfolgen  
2. **Mit Conversions gespeichert** werden: Formulareinsendungen oder Aktionen mit Tracking-Daten verknüpfen  
3. **Für Personalisierung genutzt** werden: Inhalte anhand Prospect-Daten anpassen  
4. **In Attributionsmodelle eingespeist** werden: ROI und Effektivität berechnen  
5. **Mit dem CRM synchronisiert** werden: Prospect-Datensätze mit Engagement-Daten anreichern  

**E-Mail-Kampagnen-Integration:**

Typischer Workflow von E-Mail zu Landingpage:

1. **Kampagne erstellen**: Admin erstellt Kampagne mit Landingpage  
2. **E-Mail generieren**: E-Mail-System erzeugt personalisierte URLs für jeden Prospect  
3. **Parameter-Injektion**: Prospect-ID und UTM-Parameter werden an CTA-Links angehängt  
4. **Klick-Tracking**: Optional kann die E-Mail-Plattform den ersten Klick erfassen  
5. **Landingpage-Besuch**: Frontend leitet Parameter an Backend-API weiter  
6. **Analyseaufzeichnung**: Backend speichert Besuchsdaten mit voller Attribution  
7. **Conversion-Tracking**: Aktionen (Formulare, Downloads) werden verknüpft  