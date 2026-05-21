# Employee Manager

Internal employee and HR management system. Web application providing an
employee directory, self-service profile actions, document management,
leave and time tracking, manager workflows, and audit history.

This document describes the system scope, technology choices, current
state, and planned modules.

---

## System overview

The application is composed of:

- A REST API serving employee, document, leave, and audit data.
- A single-page web client used by both employees and managers, with
  role-based views.
- A JSON-backed data store (development); designed to be swapped for a
  relational database without changes above the Infrastructure layer.

Authentication is JWT-based with refresh tokens. Authorization is
role-based (employee, manager, admin). All write operations against the
data store are routed through an atomic read-modify-write helper to
prevent race conditions under concurrent requests.

---

## Architecture

The backend follows Clean Architecture, separated into four projects:

| Project                          | Responsibility                          |
| -------------------------------- | --------------------------------------- |
| `EmployeeManager.Domain`         | Models, interfaces, domain rules        |
| `EmployeeManager.Application`    | Services, orchestration, business logic |
| `EmployeeManager.Infrastructure` | Persistence (`JsonDataStore`), I/O      |
| `EmployeeManager.API`            | HTTP endpoints, middleware, auth        |

The client (`EmployeeManager.Client`) is a separate React application,
served independently in development and proxied via the API's static-file
middleware in deployed environments.

Dependency direction: `API → Application → Domain`, with Infrastructure
implementing Domain interfaces. The client communicates with the API
exclusively over HTTP/JSON.

---

## Technology

### Backend

| Concern        | Choice                                       |
| -------------- | -------------------------------------------- |
| Runtime        | .NET 10                                      |
| Framework      | ASP.NET Core 10                              |
| Persistence    | JSON file store (`JsonDataStore`)            |
| Authentication | JWT bearer + refresh tokens                  |
| Real-time      | SignalR (planned)                            |
| Background     | Hosted services for notifications, audit (planned) |

### Frontend

| Concern        | Choice                                    | State          |
| -------------- | ----------------------------------------- | -------------- |
| Framework      | React 19.2                                | In use         |
| Language       | TypeScript 4.9, strict mode               | In use         |
| Routing        | react-router-dom 7 (data-router API)      | In use         |
| Server state   | TanStack Query 5                          | In use         |
| HTTP client    | axios 1.14                                | In use         |
| Notifications  | react-toastify                            | In use         |
| Forms          | React Hook Form + Zod                     | Planned        |
| Styling        | Tailwind CSS                              | Planned        |
| Client state   | Zustand                                   | Planned        |
| Build tooling  | react-scripts → Vite                      | Migration planned |
| Testing        | React Testing Library, Playwright         | Planned        |
| Real-time      | SignalR client                            | Planned        |

### Repository layout

```
EmployeeManager/
├── EmployeeManager.API/            ASP.NET Core Web API
├── EmployeeManager.Application/    Business logic
├── EmployeeManager.Domain/         Models and interfaces
├── EmployeeManager.Infrastructure/ Persistence
└── EmployeeManager.Client/         React SPA
```

---

## Current state

As of 2026-05-21, the foundation work is approximately 82% complete.
Feature modules begin once the foundation closes.

| Area                                   | State       |
| -------------------------------------- | ----------- |
| Backend API, JSON store, JWT auth      | Complete    |
| React migration to TypeScript (strict) | Complete    |
| Server-state layer (TanStack Query)    | Complete    |
| Routing layer (data router, typed URLs) | Complete   |
| Forms (RHF + Zod)                      | In progress |
| Auth hardening (refresh, first-login)   | Pending    |
| Styling (Tailwind)                     | Pending     |
| Client state (Zustand)                 | Pending     |

Detailed per-task history is tracked in [`CHALLENGES.md`](./CHALLENGES.md).

---

## Module roadmap

Modules are grouped into two phases. Each module includes both the API
endpoints and the corresponding client views.

### Phase 1 — Core HR functionality

| Module               | Scope                                                       |
| -------------------- | ----------------------------------------------------------- |
| My Profile           | Employee self-service read view of own record               |
| Change Password      | Authenticated password change; first-login forced reset     |
| Documents            | Per-employee document upload, listing, and admin review     |
| Leave Management     | Balance accrual, request submission, approval, rollback     |
| Notifications        | In-app inbox with read/unread state                          |
| Audit Log            | Immutable record of state-changing operations               |
| Manager Dashboard    | Aggregated team views with drill-down to individual records |
| Time Tracking        | Clock in/out and weekly timesheets                          |
| Performance Review   | Periodic review cycle with manager and employee inputs      |
| Onboarding Wizard    | Multi-step flow for new-hire data collection                |
| Bulk Operations      | CSV import/export and batch updates                         |

### Phase 2 — Platform capabilities

Real-time updates (SignalR), automated testing (unit, integration, E2E),
accessibility audit, performance pass, internationalization, offline /
PWA support, build tooling migration to Vite, Storybook for component
documentation, animation primitives, CI/CD pipeline, containerization,
monorepo restructure, server-side rendering evaluation, security review,
responsive/mobile pass, design-system primitives.

---

## Timeline

Estimates assume sustained progress at the current cadence and include
slack for unplanned work. Dates are target windows, not commitments.

| Milestone                          | Target          |
| ---------------------------------- | --------------- |
| Foundation complete                | End of May 2026 |
| Phase 1 modules complete           | Mid-July 2026   |
| Phase 2 platform work complete     | September 2026  |

---

## Running locally

Prerequisites: .NET 10 SDK, Node.js 18+.

```
# API
cd EmployeeManager.API
dotnet run                              # listens on http://localhost:5000

# Client (separate terminal)
cd EmployeeManager.Client
npm install
npm start                               # serves http://localhost:3000
```

The client dev server proxies `/api` requests to the backend (see
`EmployeeManager.Client/package.json`).

Default development credentials: `admin` / `admin123`.

---

## Branches

| Branch             | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `main`             | Integration branch. Updated via pull request.    |
| `Developer-Branch` | Active development. All new work lands here first. |
