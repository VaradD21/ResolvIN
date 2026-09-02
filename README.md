# ResolveDesk

Autonomous support desk backend for D2C brands. Auto-classifies and auto-resolves routine customer support tickets against brand policy rules, escalating only ambiguous/high-stakes cases to humans.

## Status

**Foundation layer complete and tested.**

### ✅ Completed
- [x] Project structure (Maven, Spring Boot 3.3.4, Java 21)
- [x] PostgreSQL schema with JSONB support
- [x] Domain entities: `Brand`, `Ticket`, `TicketEvent`, `OrderCache`
- [x] Enums: `TicketStatus` (NEW, PROCESSING, RESOLVED, ESCALATED, CLOSED), `TicketCategory`
- [x] JPA repositories for all entities
- [x] REST controller: `POST /tickets`, `GET /tickets/{id}`
- [x] Integration test: ticket creation via API, persistence verification
- [x] Docker Compose setup (PostgreSQL 16-alpine)
- [x] `mvn test` passing end-to-end
- [x] `mvn spring-boot:run` starting cleanly

### ⏳ Not Yet Built
- Ticket classifier (LLM-based)
- Policy engine (JSON-based rules evaluation)
- Auto-resolver (rule matching → action execution)
- Escalation logic
- Additional REST endpoints (GET list, webhook handlers, etc.)

## Quick Start

### Prerequisites
- Java 21
- Maven 3.9+
- Docker + Docker Compose

### Run

**Terminal 1: Start Postgres**
```bash
cd E:\VIBECODESETUP\resolvin\resolvedesk
docker compose up -d
```

**Terminal 2: Start Spring Boot app**
```bash
mvn spring-boot:run
```

App runs on `http://localhost:8080`.

### Test the API

**Create a ticket:**
```powershell
$body = @{
  customerEmail = "customer@example.com"
  subject = "Where is my order?"
  body = "I haven't received my package yet."
  brandId = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/tickets" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Fetch a ticket:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/tickets/1" -Method GET
```

### Run Tests

```bash
mvn clean test
```

Tests use Testcontainers (PostgreSQL 16-alpine), so Docker must be running.

## Architecture

- **Domain**: `com.resolvedesk.domain` — JPA entities, enums
- **Repository**: `com.resolvedesk.repository` — Spring Data JPA interfaces
- **Web**: `com.resolvedesk.web` — REST controllers, request/response DTOs
- **Schema**: `src/main/resources/schema.sql` — DDL (tables: brands, orders_cache, tickets, ticket_events, actions, escalations)

## Configuration

- `src/main/resources/application.yml` — Production profile (connects to Docker Postgres on port 5433)
- `src/test/resources/application.yml` — Test profile (uses Testcontainers)
- `docker-compose.yml` — Local Postgres on port 5433 (user: `resolvedesk`, password: `resolvedesk`, db: `resolvedesk`)

## Next Steps

1. Build classifier to categorize tickets (WISMO, return, exchange, etc.)
2. Implement policy rules engine
3. Add auto-resolver actions (e.g., send tracking link, process refund)
4. Escalation service for ambiguous cases
5. Webhook endpoints for inbound emails/chat
6. Admin dashboard for policy management

---

**Stack**: Java 21 · Spring Boot 3.3.4 · PostgreSQL 16 · Maven · Lombok · Testcontainers
