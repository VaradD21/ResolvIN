# Development Setup Guide

This guide walks through setting up and running the full **ResolveDesk** stack (PostgreSQL, Spring Boot backend, and React frontend) on your local development machine.

---

## Prerequisites

Ensure the following tools are installed on your system:
- **Java 21**: JDK 21 installed and on your `PATH`.
- **Docker Desktop**: Running for PostgreSQL 16.
- **Node.js**: Node 18+ and npm installed.
- **Maven**: Optional (the bundled Maven wrapper `mvnw.cmd` can be used directly).

---

## Step 1: Start PostgreSQL

ResolveDesk uses Docker Compose to manage PostgreSQL 16 on host port **5434**.

Open a terminal and run:
```powershell
cd e:\VIBECODESETUP\ResolvIN\resolvedesk
docker compose up -d
```

Verify that the database container is running:
```powershell
docker ps
```
The database will initialize with user `resolvedesk`, password `resolvedesk`, and database `resolvedesk`. Schema definitions and seed data from `src/main/resources/schema.sql` are applied automatically by Spring Boot on startup.

---

## Step 2: Configure Environment Variables (Optional)

In `src/main/resources/application.yml`, the application defaults to using dummy LLM keys for unit and offline testing.

To enable live Google Gemini AI classification, set:
```powershell
$env:LLM_PROVIDER="gemini"
$env:LLM_API_KEY="your-gemini-api-key-here"
$env:LLM_MODEL="gemini-1.5-flash"
```
*(If no key is provided, the backend safely falls back to offline classification or escalates ambiguous tickets).*

---

## Step 3: Run Spring Boot Backend

In a dedicated terminal:
```powershell
cd e:\VIBECODESETUP\ResolvIN\resolvedesk
.\mvnw.cmd spring-boot:run
```

Once started, the backend API will be live at:
```
http://localhost:8080
```

### Running Backend Tests
To run unit and integration tests (uses Testcontainers):
```powershell
.\mvnw.cmd test
```

---

## Step 4: Run Frontend Development Server

In a second terminal:
```powershell
cd e:\VIBECODESETUP\ResolvIN\resolvedesk\frontend
npm install
npm run dev
```

The frontend web interface will be available at:
```
http://localhost:5173
```

---

## Step 5: Build Production Static Assets

To verify that the frontend compiles cleanly into a static bundle (for web deployment or Tauri wrapping):
```powershell
cd e:\VIBECODESETUP\ResolvIN\resolvedesk\frontend
npm run build
```
This will compile TypeScript and output the distribution files into `frontend/dist/`.

---

## Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `Failed to connect to backend at http://localhost:8080` | Spring Boot is not running or crashed. | Check the Spring Boot terminal for errors and verify port 8080 is available. |
| `Connection refused: localhost:5434` | PostgreSQL container is stopped. | Run `docker compose up -d` in the project root. |
| `Brand not found (404)` on ticket creation | Brand ID does not exist in the database. | Use Brand ID 1 (`Acme Clothing`), which is seeded by default in `schema.sql`. |
| CORS errors in browser console | Origin not allowed. | Ensure backend includes `WebConfig.java` allowing `http://localhost:5173`. |
