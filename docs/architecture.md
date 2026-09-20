# Architecture Overview

This document outlines the system architecture of **ResolveDesk**, detailing how incoming support tickets transition through autonomous classification, order verification, policy evaluation, and action execution.

---

## High-Level System Architecture

ResolveDesk is composed of a Spring Boot backend, a PostgreSQL relational datastore, an LLM provider for zero-shot text classification, and a static React + TypeScript frontend (distributable as a web app or packaged via Tauri).

```mermaid
graph TD
    Client["User / Support Agent<br/>(Browser / Tauri Desktop)"] -->|REST API (JSON)| ControllerLayer["Spring Boot Web Layer<br/>(REST Controllers, CORS)"]
    
    subgraph SpringBootApp ["ResolveDesk Backend"]
        ControllerLayer --> TicketOrch["TicketOrchestrator<br/>(Async Pipeline)"]
        TicketOrch --> PreFilter["Escalation Pre-Filter<br/>(Keyword Scanner)"]
        PreFilter -->|Routine Case| Classifier["ClassifierService<br/>(Gemini / LlmClient)"]
        PreFilter -->|High Risk / Legal| EscalationRepo["Escalation Service"]
        
        Classifier --> OrderLookup["Order Cache Service<br/>(Order & Tracking Lookup)"]
        OrderLookup --> PolicyEngine["Deterministic Policy Engine<br/>(Brand SLA & Eligibility Rules)"]
        
        PolicyEngine -->|Eligible| ActionExec["Action Dispatcher &<br/>Customer Auto-Reply"]
        PolicyEngine -->|Ineligible / Ambiguous| EscalationRepo
    end
    
    subgraph DataStore ["PostgreSQL 16"]
        TicketOrch --> DB[(PostgreSQL Database)]
        EscalationRepo --> DB
        ActionExec --> DB
    end
```

---

## Core Components

### 1. Web Layer (`com.resolvedesk.web`)
- **`TicketController`**: Exposes endpoints to create tickets (`POST /tickets`), list tickets (`GET /tickets`), and view ticket details with complete event timelines (`GET /tickets/{id}`).
- **`BrandController`**: Exposes registered D2C brands (`GET /brands`).
- **`EscalationController`**: Exposes unresolved cases requiring human review (`GET /escalations`).
- **`GlobalExceptionHandler`**: Translates validation and runtime errors into structured JSON responses.
- **`WebConfig`**: Manages Cross-Origin Resource Sharing (CORS) for Vite dev servers and Tauri desktop protocols.

### 2. Autonomous Orchestrator (`com.resolvedesk.service.TicketOrchestrator`)
When a ticket is posted:
1. It is saved to the database with status `NEW`.
2. An asynchronous task (`processNewTicketAsync`) is triggered immediately.
3. Steps are logged to the `ticket_events` audit table:
   - `ticket_classified`
   - `policy_checked`
   - `action_taken` (if auto-resolved)
   - `replied` (customer response recorded)
   - `escalated` (flagged for human review)

### 3. Classification Service (`com.resolvedesk.service.ClassifierService`)
- Pre-scans ticket text for critical escalation keywords (e.g. `lawyer`, `legal notice`, `chargeback`, `consumer court`, abusive language).
- If clean, passes the prompt to `GeminiClient` to extract:
  - **Category**: `WISMO`, `RETURN`, `EXCHANGE`, `REFUND_STATUS`, `CANCELLATION`, `OTHER`.
  - **Confidence Score**: 0.0 to 1.0.
  - **Extracted Order ID**: e.g., `ORD-001`.
  - **Extracted Intent**: Brief semantic intent summary.

### 4. Deterministic Policy Evaluator (`com.resolvedesk.service.PolicyEvaluator`)
- Pure Java rule engine without LLM non-determinism.
- Validates brand policy constraints:
  - Return/Exchange window (e.g., within 30 days of delivery).
  - Non-returnable product categories (e.g., innerwear, cosmetics).
  - Maximum order value allowed for auto-resolution (e.g., ₹3,000).
  - Cancellation eligibility (before fulfillment/shipped state).
- Emits a `PolicyDecision` (`eligible`: boolean, `action`: `REFUND` | `EXCHANGE` | `CANCEL` | `REPLY_ONLY` | `NONE`, `reason`: string).

### 5. Frontend (`frontend/`)
- Pure single-page application built with React 18 and Vite.
- Framework-light styling with Tailwind CSS.
- Client-side navigation via `HashRouter` for zero-configuration compatibility inside Tauri desktop webviews and static web hosts.
