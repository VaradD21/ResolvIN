# Frontend & Tauri Desktop Guide

The ResolveDesk frontend is built with React 18, TypeScript, and Vite. It is designed to be built once into a static bundle and deployed either to a web server or packaged as a desktop application using **Tauri**.

---

## Technical Stack & Architecture

- **Build Tool**: Vite 6
- **Language**: TypeScript 5 (strict mode, zero `any`)
- **Styling**: Tailwind CSS (framework-light, no heavy UI dependencies)
- **Icons**: Lucide React
- **Routing**: `react-router-dom` using `HashRouter`
- **Tauri Compatibility**: Relative asset resolution (`base: './'`) and hash-based routing prevent file protocol and URL rewrite 404 errors in desktop webviews.

---

## Environment Configuration

The API base URL is completely configurable and never hardcoded.

In `frontend/.env`:
```env
# Point to your local Spring Boot instance or remote backend
VITE_API_BASE_URL=http://localhost:8080
```

---

## Page Overview

### 1. Tickets List (`/#/`)
- Responsive table listing all tickets (ID, Customer Email, Subject, Category Badge, Status Badge, Timestamp).
- Clicking any row navigates directly to `/tickets/:id`.
- Includes a manual refresh button to poll for state changes.

### 2. Ticket Detail (`/#/tickets/:id`)
- Displays ticket subject, customer email, brand ID, status badge, and AI confidence percentage.
- Shows customer inquiry text in a formatted card.
- **Readable Event Timeline**: Converts raw backend event records into dedicated visual cards:
  - `ticket_classified`: Category, confidence %, order ID, intent, reasoning.
  - `policy_checked`: Eligibility, action name, rule logic.
  - `action_taken`: Dispatched action details.
  - `replied`: Automated message sent to customer.
  - `escalated`: Escalation trigger explanation.

### 3. Escalations Queue (`/#/escalations`)
- Dedicated interface for human agents to triage ambiguous or high-stakes tickets.
- Displays escalation reason, customer contact, and an expandable **Context Bundle Viewer**:
  - Two-column view: AI Classification vs. Policy Engine Evaluation.
  - Collapsible raw JSON viewer for complete telemetry inspection.

### 4. New Ticket Form (`/#/tickets/new`)
- Form to submit new support inquiries.
- Includes client-side email and field validation.
- Dynamically loads registered brands from `GET /brands`.
- Submitting redirects to the newly created ticket detail page to observe real-time async processing.

---

## Packaging as a Desktop App with Tauri

Because the frontend is 100% static with zero server runtime dependencies, wrapping it with Tauri takes only a few steps:

### 1. Install Tauri CLI
```powershell
cd e:\VIBECODESETUP\ResolvIN\resolvedesk\frontend
npm install -D @tauri-apps/cli
```

### 2. Initialize Tauri
```powershell
npx tauri init
```
When prompted:
- **App Name**: `ResolveDesk`
- **Window Title**: `ResolveDesk — Autonomous Support Desk`
- **Web assets directory**: `../dist`
- **Dev server URL**: `http://localhost:5173`
- **Frontend dev command**: `npm run dev`
- **Frontend build command**: `npm run build`

### 3. Run Desktop App in Development
```powershell
npx tauri dev
```

### 4. Build Production Desktop Installer (.exe / .msi)
```powershell
npx tauri build
```
The resulting desktop binary will run natively on Windows while connecting to your configured Spring Boot backend.
