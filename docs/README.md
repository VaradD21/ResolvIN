# ResolveDesk Documentation

Welcome to the **ResolveDesk** project documentation. ResolveDesk is an autonomous support desk platform designed for Indian Direct-to-Consumer (D2C) brands. It auto-classifies and auto-resolves routine customer support inquiries (WISMO, returns, exchanges, cancellations, refunds) against brand-specific policies and escalates high-stakes or ambiguous cases to human agents with rich context.

---

## Documentation Directory

The project documentation is split into modular topics:

| Document | Description |
| :--- | :--- |
| [Architecture Overview](./architecture.md) | High-level system architecture, component breakdown, and pipeline data flow diagram. |
| [API Reference](./api-reference.md) | Full specification of REST endpoints, request/response models, and status codes. |
| [Database Schema](./database-schema.md) | PostgreSQL schema, JSONB columns, table relationships, and initial seed data. |
| [Policy & Classification Engine](./policy-engine.md) | AI intent classification, deterministic rules engine, SLA calculations, and escalation triggers. |
| [Frontend & Tauri Guide](./frontend-guide.md) | React 18 + Vite + TypeScript architecture, UI components, and desktop packaging with Tauri. |
| [Development & Setup Guide](./development-setup.md) | Step-by-step instructions to run Docker, PostgreSQL, Spring Boot, and Vite locally. |

---

## Technology Stack Summary

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Maven, Lombok.
- **Database**: PostgreSQL 16 (Alpine) with JSONB support for policies and event logs.
- **AI / LLM Layer**: Pluggable `LlmClient` abstraction with Google Gemini (`gemini-1.5-flash`), with fallback and keyword pre-filtering.
- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS, React Router (HashRouter), Lucide React.
- **Desktop Target**: Tauri (v2 ready, static bundle wrapping).
