# ResolveDesk Frontend

A framework-light, production-ready React + Vite + TypeScript frontend for **ResolveDesk** — the autonomous support desk for D2C brands.

Built to be compiled once into a static `dist/` bundle and deployed as a website, or wrapped in **Tauri** as a desktop app, both communicating with the Spring Boot backend REST API.

---

## Features

- ⚡ **Lightweight & Fast**: React 18, Vite 6, and Tailwind CSS without heavy runtime component libraries (zero friction for Tauri webviews).
- ⚙️ **Configurable API Endpoint**: Never hardcoded. Configured via `VITE_API_BASE_URL` in `.env`.
- 🎫 **Tickets Overview (`/`)**: Formatted table with customer email, subject, category badge, color-coded status indicator, and date formatting.
- 🔍 **Ticket Detail & Timeline (`/tickets/:id`)**: Displays subject/body, confidence score, and converts raw backend event JSONB (`ticket_classified`, `policy_checked`, `action_taken`, `replied`, `escalated`) into a clean, human-readable timeline.
- 🚨 **Escalations Queue (`/escalations`)**: Prioritized view of unresolved escalations displaying ticket summary, escalation reason, and an expandable context bundle viewer breaking down AI classification results vs. deterministic policy evaluation.
- ➕ **New Ticket Form (`/tickets/new`)**: Client-validated form to simulate incoming tickets with brand selection, subject, and body inquiry. Automatically redirects to the created ticket to watch the async pipeline in action.
- 🖥️ **Tauri & Static Ready**: Uses `HashRouter` and relative asset paths (`base: './'`) to ensure compatibility with local file protocols, Tauri custom protocols, and static web hosts without deep-link 404s.

---

## Backend API Endpoints & Contract Status

| Endpoint | Method | Backend Status | Frontend Handling |
| :--- | :--- | :--- | :--- |
| `/tickets` | `POST` | ✅ Implemented | Calls backend to create ticket; redirects to detail view. |
| `/tickets/{id}` | `GET` | ✅ Implemented | Fetches full ticket details, status, and event timeline. |
| `/escalations` | `GET` | ✅ Implemented | Fetches unresolved human escalations with context bundles. |
| `/tickets` | `GET` | ⏳ **Pending on Backend** | **Stubbed**: Frontend provides mock preview data and displays a non-intrusive alert until implemented on backend. |
| `/brands` | `GET` | ⏳ **Pending on Backend** | **Stubbed**: Dropdown uses seeded brands (`Acme Clothing`, etc.) with fallback notice until backend exposes endpoint. |
| `/escalations/{id}/resolve` | `POST` | ⏳ **Pending on Backend** | Escalations page provides inspection mode; approve/deny actions will wire into this endpoint once created. |

---

## Quick Start (Manual Execution Commands)

> **Note**: As per environment rules, run these commands manually in your terminal.

### 1. Navigate to the frontend directory
```bash
cd e:\VIBECODESETUP\ResolvIN\resolvedesk\frontend
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already done by default):
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build Static Production Bundle (For Web & Tauri)
```bash
npm run build
```
This compiles TypeScript and outputs a clean static bundle in `frontend/dist/`.

---

## Wrapping with Tauri (Desktop App)

Because this frontend has zero server-side dependencies and resolves assets relatively (`base: './'`), wrapping it with Tauri is seamless:

```bash
# In e:\VIBECODESETUP\ResolvIN\resolvedesk\frontend
npm install -D @tauri-apps/cli
npx tauri init
```

In `src-tauri/tauri.conf.json`:
- Set `build.distDir` to `../dist`
- Set `build.devPath` to `http://localhost:5173`
- Run desktop dev mode:
```bash
npx tauri dev
```
- Build desktop installer:
```bash
npx tauri build
```

---

## Project Structure

```
frontend/
├── .env                      # Local environment (VITE_API_BASE_URL)
├── .env.example              # Template environment
├── index.html                # Vite HTML entry
├── package.json              # React, React Router, Tailwind, Lucide
├── vite.config.ts            # Tauri-compatible build configuration
├── tailwind.config.js        # Design tokens and styling rules
├── tsconfig.json             # Strict TypeScript configuration
└── src/
    ├── main.tsx              # React entry
    ├── App.tsx               # Route declarations & shell layout
    ├── index.css             # Tailwind base styles
    ├── api/
    │   ├── client.ts         # Central fetch client with error handling
    │   ├── ticketsApi.ts     # Ticket creation, detail, and list stub
    │   ├── escalationsApi.ts # Escalations queue fetcher
    │   └── brandsApi.ts      # Brand lookup with fallback
    ├── types/
    │   ├── ticket.ts         # Status, Category, Ticket, Event types
    │   ├── escalation.ts     # Escalation and ContextBundle models
    │   ├── brand.ts          # Brand interface
    │   └── api.ts            # Pagination and API error models
    ├── hooks/
    │   ├── useTickets.ts     # Tickets list hook
    │   ├── useTicketDetail.ts# Ticket detail and events hook
    │   ├── useEscalations.ts # Escalations queue hook
    │   └── useBrands.ts      # Brands selector hook
    ├── components/
    │   ├── common/           # Navbar, StatusBadge, CategoryBadge, etc.
    │   ├── tickets/          # TicketTable, EventTimeline, EventItem
    │   └── escalations/      # EscalationCard, ContextBundleView
    └── pages/
        ├── TicketsListPage.tsx    # Route `/`
        ├── TicketDetailPage.tsx   # Route `/tickets/:id`
        ├── EscalationsPage.tsx    # Route `/escalations`
        └── NewTicketPage.tsx      # Route `/tickets/new`
```
