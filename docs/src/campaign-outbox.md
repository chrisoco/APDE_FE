# Kampagnen-E-Mail-Outbox System

Ein umfassendes E-Mail-Marketing-System, das Kampagnen-Managern ermöglicht, zielgerichtete E-Mails an Interessenten mit Echtzeit-Statistiken, Duplikat-Prävention und intelligenter Interessenten-Zielgruppenansprache zu senden.

## Überblick

Das Kampagnen-E-Mail-Outbox System ist die zentrale E-Mail-Verteilungs-Engine der APDE-Plattform. Es bietet eine benutzerfreundliche Schnittstelle zum Versenden von Kampagnen-E-Mails an Interessenten mit ausgeklügelter Filterung, Statistik-Verfolgung und Sicherheitsfunktionen zur Vermeidung versehentlicher Duplikat-Mailings.

### Hauptfunktionen

- **Kampagnen-Auswahl**: Auswahl aus aktiven Kampagnen mit durchsuchbarem Combobox-Dropdown
- **Echtzeit-Statistiken**: Live E-Mail-Versand-Metriken und Interessenten-Abdeckungs-Analytics
- **Duplikat-Prävention**: Intelligente Filterung zur Vermeidung erneuter Sendungen an benachrichtigte Interessenten
- **Duplikat-Mailings erlauben**: Optionale Checkbox-Einstellung zur Ermöglichung von Duplikat-Mailings bei Bedarf
- **Entwicklungs-Sicherheit**: Eingeschränkter E-Mail-Versand in lokaler Entwicklungsumgebung
- **Fortschritts-Verfolgung**: Visuelle Fortschrittsbalken zur Anzeige der Kampagnen-Abdeckung
- **Fehlerbehandlung**: Umfassende Fehlerberichterstattung und Toast-Benachrichtigungen

## System-Architektur

### Kern-Komponenten

1. **Kampagnen-Auswahl-Schnittstelle** - Durchsuchbare Combobox für aktive Kampagnen
2. **Statistik-Dashboard** - Echtzeit-Metriken und Fortschritts-Visualisierung in verschachtelter Card
3. **E-Mail-Versand-Engine** - Backend-API-Integration mit Authentifizierung und CSRF-Schutz
4. **Fortschritts-Verfolgung** - Visuelle Indikatoren der Kampagnen-Abdeckung mit Prozentanzeige
5. **Fehler-Management** - Toast-Benachrichtigungen und Inline-Fehleranzeige

### Datenfluss

```typescript
Kampagnen-Auswahl → Statistiken Laden → Optionen Konfigurieren → E-Mails Senden → Statistiken Aktualisieren
```

## Benutzeroberflächen-Struktur

### Haupt-Dashboard

**Standort**: `/admin/campaign-outbox`
**Zweck**: Zentrale Schaltstelle für E-Mail-Kampagnen-Management

**Layout-Komponenten:**
- Kopfzeile mit Titel "Campaign Email Outbox" und Beschreibung
- Hauptkarte für Kampagnen-Auswahl und Versand-Steuerung
- Verschachtelte Statistik-Dashboard-Karte
- Versand-Optionen mit Checkbox für Duplikat-Mailings
- Fortschritts-Indikatoren und Fehlerbehandlung

### Kampagnen-Auswahl

**Komponente**: `Combobox` mit durchsuchbaren aktiven Kampagnen
**Verhalten**:
- Filtert Kampagnen, um nur `status === 'Active'` anzuzeigen
- Lädt Statistiken automatisch bei Kampagnen-Auswahl
- Löscht Statistiken bei leerer Auswahl

```typescript
// Kampagnen-Filterlogik
const campaigns = allCampaigns.filter(campaign => campaign.status === 'Active')
```

## Statistik-System

### Verfolgte Metriken

Das System verfolgt umfassende E-Mail-Versand-Metriken für jede Kampagne:

```typescript
interface SentEmailsStats {
  total_emails_sent: number      // Gesamte versendete E-Mails für diese Kampagne
  notified_prospects: number     // Eindeutige Interessenten, die E-Mails erhalten haben
  available_prospects: number    // Für Versendung verfügbare Interessenten
  total_prospects: number        // Gesamte Interessenten, die dem Kampagnen-Filter entsprechen
}
```

### Statistik-Dashboard

**Echtzeit-Updates:**
- Statistiken laden automatisch bei Kampagnen-Auswahl
- Aktualisierung nach erfolgreichem E-Mail-Versand
- Lade-Zustände während Datenabruf (behält vorherige Werte bei)

**Visuelle Elemente:**
- **Metrik-Karten**: Vierspaltiges Grid mit Schlüsselzahlen (responsive: 4/2/1 Spalten)
- **Fortschritts-Balken**: Visuelle Darstellung der Kampagnen-Abdeckung
- **Abdeckungs-Prozentsatz**: Berechnete Fertigstellungsrate

```typescript
// Abdeckungs-Berechnung
const coveragePercentage = (notified_prospects / total_prospects) * 100
```

### Statistik-API-Integration

**Endpoint**: `GET /api/campaigns/{campaignId}/send-emails/sent`

**Antwort-Format:**
```json
{
  "total_emails_sent": 1250,
  "notified_prospects": 950,
  "available_prospects": 350,
  "total_prospects": 1300
}
```

**Lade-Verhalten:**
- Nicht-blockierendes Laden der Statistiken
- Vorherige Werte bleiben während Aktualisierung erhalten
- Fehlerbehandlung mit eleganten Fallbacks

## E-Mail-Versand-System

### Versand-Workflow

1. **Kampagnen-Validierung**: Sicherstellen, dass Kampagne ausgewählt ist
2. **Parameter-Konfiguration**: Force-Option anwenden, falls aktiviert
3. **API-Anfrage**: E-Mail-Anfrage mit Authentifizierung und CSRF-Schutz senden
4. **Antwort-Verarbeitung**: Erfolgs-/Fehler-Antworten behandeln
5. **Statistik-Aktualisierung**: Metriken nach erfolgreichem Versand aktualisieren
6. **Benutzer-Feedback**: Toast-Benachrichtigungen anzeigen

### API-Integration

**Endpoint**: `POST /api/campaigns/{campaignId}/send-emails`

**Anfrage-Optionen:**
```typescript
{
  method: 'POST',
  requiresAuth: true,
  includeCSRF: true,
  params: forceOption ? { force: true } : undefined
}
```

**Antwort-Format:**
```typescript
interface EmailSendResponse {
  message: string
  emails_sent: number           // In diesem Batch versendete E-Mails
  total_emails_sent: number     // Gesamt versendete E-Mails für Kampagne
  notified_prospects: number    // Eindeutige benachrichtigte Interessenten
  available_prospects: number   // Noch verfügbare Interessenten
  total_prospects: number       // Gesamte Kampagnen-Interessenten
}
```

### Versand-Optionen

**Duplikat-Mailings erlauben (`force: true`)**:
- **Zweck**: Versendung an bereits benachrichtigte Interessenten ermöglichen
- **Anwendungsfälle**:
  - Erneute Sendung wichtiger Updates
  - Nachfass-Kampagnen
  - Testen von E-Mail-Variationen
- **Sicherheit**: Erfordert explizite Benutzer-Bestätigung über Checkbox

**Normaler Versand (Standard)**:
- **Zweck**: Nur an noch nicht kontaktierte Interessenten senden
- **Verhalten**: Filtert bereits benachrichtigte Interessenten automatisch heraus
- **Sicherheit**: Verhindert versehentliche Duplikat-E-Mails

## Entwicklungsumgebungs-Kontrollen

### Sicherheit der lokalen Entwicklung

**Umgebungs-Erkennung:**
```typescript
import.meta.env.VITE_APP_ENV === 'local'
```

**Entwicklungs-Beschränkungen:**
- **Normaler Versand**: Nur 1 E-Mail wird versendet (zum Testen)
- **Force-Versand**: Maximal 3 E-Mails werden versendet
- **Visuelle Warnung**: Rote Textwarnung in der Benutzeroberfläche

**Warnungs-Anzeige:**
```
"For development purpose only one email will be sent and on 'Allow duplicate mailing' three."
```

**Zweck:**
- Versehentlichen Massen-E-Mail-Versand während der Entwicklung verhindern
- Funktionalitäts-Tests mit minimaler Auswirkung ermöglichen
- Schutz vor Fehlern in der Entwicklungsumgebung
