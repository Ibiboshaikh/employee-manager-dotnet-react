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

Authentication is JWT-based with refresh tokens, with Google (Gmail)
sign-in planned for pre-provisioned accounts. Authorization is currently
role-based (employee, manager, admin); a migration to permission-based
access control (PBAC) is planned (see Phase 2). All write operations
against the data store are routed through an atomic read-modify-write
helper to prevent race conditions under concurrent requests.

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
| Forms          | React Hook Form + Zod                     | In use         |
| Styling        | Tailwind CSS                              | In use         |
| Client state   | Zustand                                   | In use         |
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

### Frontend dependencies (installed)

Packages currently in `EmployeeManager.Client/package.json`. Each entry
records the version, the round it was introduced, and the reason it
was chosen over the alternatives.

| Package                          | Version | Introduced | Why                                                                                     |
| -------------------------------- | ------- | ---------- | --------------------------------------------------------------------------------------- |
| `react`                          | 19.2    | Round 2    | Core UI library. The project's reason to exist.                                         |
| `react-dom`                      | 19.2    | Round 2    | React's renderer for the browser DOM.                                                   |
| `react-scripts`                  | 5.0.1   | Round 2    | Create React App build tooling. Migration to Vite planned (Round 48).                   |
| `typescript`                     | 6.0     | Round 14   | Compile-time type safety. Strict mode enforced from Round 16.                           |
| `@types/react`                   | 19.2    | Round 14   | TypeScript definitions for React's JSX and hooks.                                       |
| `@types/react-dom`               | 19.2    | Round 14   | TypeScript definitions for `react-dom`.                                                 |
| `@types/node`                    | 25.7    | Round 14   | TypeScript definitions for Node globals used in tooling.                                |
| `react-router-dom`               | 7.13    | Round 18   | Client-side routing. v7 ships the data-router API used for typed route helpers.         |
| `axios`                          | 1.14    | Round 17   | HTTP client. Used over `fetch` for interceptors (auth header injection, 401 refresh).   |
| `@tanstack/react-query`          | 5.100   | Round 17   | Server-state cache. Replaced the hand-rolled `useEmployees` hook with caching, retries, mutations, and devtools. |
| `@tanstack/react-query-devtools` | 5.100   | Round 17   | In-browser query inspector. Visualises cache state, query lifecycle, and invalidations. |
| `react-toastify`                 | 11.0    | Round 7    | Pop-up notifications for success/error feedback. Single `<ToastContainer />` in App.tsx.|
| `react-hook-form`                | 7.76    | Round 19   | Form state management. Chosen for uncontrolled-input performance and minimal re-renders.|
| `zod`                            | 4.4     | Round 19   | Runtime schema validation. Drives both validation rules and inferred TypeScript types.  |
| `@hookform/resolvers`            | 5.4     | Round 19   | Bridges Zod schemas into React Hook Form via `zodResolver(schema)`.                     |
| `zustand`                        | 5.0     | Round 22   | Lightweight global-state store. Backs theme (dark mode) and recent-activity with selective subscriptions (`useShallow` for object selectors), `persist` + `devtools` middleware; reduces prop drilling without Context re-render fan-out. |
| `date-fns`                       | 4.4     | Round 23.3 | Deterministic date formatting on the profile page. Avoids `toLocaleDateString` locale drift. |
| `@testing-library/react`         | 16.3    | (CRA default) | Component testing library. Active use begins Round 42.                              |
| `@testing-library/jest-dom`      | 6.9     | (CRA default) | Custom Jest matchers for DOM assertions (`toBeInTheDocument`, etc.).                |
| `@testing-library/user-event`    | 13.5    | (CRA default) | User-interaction simulation for tests.                                              |
| `@testing-library/dom`           | 10.4    | (CRA default) | Core querying primitives used by React Testing Library.                             |
| `web-vitals`                     | 2.1     | (CRA default) | Browser performance metric collection. Reactivated during Round 45 perf pass.       |

> **Resolved (Tailwind, Round 21):** `tailwindcss` (3.4), `postcss` (8.5),
> and `autoprefixer` (10.5) are now declared in `package.json`, so a clean
> `npm install` restores the build. `clsx` is still not installed — adopt it
> (to `dependencies`) only if conditional `className` composition is needed.

### Frontend dependencies (planned)

Reserved for upcoming rounds. Listed here so the rationale is recorded
before installation, not retrofitted afterwards.

| Package                  | Planned round | Why                                                                                  |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------ |
| `clsx`                   | Round 21.2    | Conditional `className` composition. Standard companion to Tailwind. (Not yet installed.) |
| `react-day-picker`       | Round 29.4    | Date-range picker for leave-request form.                                             |
| `recharts`               | Round 34.3    | Chart library for manager dashboard KPIs.                                             |
| `@microsoft/signalr`     | Round 41      | Real-time client for SignalR hub (live notifications, presence).                      |
| `vitest`                 | Round 42      | Test runner. Pairs with Vite migration (Round 48).                                    |
| `@playwright/test`       | Round 43      | End-to-end browser testing.                                                           |
| `framer-motion`          | Round 51      | Animation primitives (page transitions, list enter/exit).                             |

### Backend NuGet packages (installed)

All backend dependencies ship with the .NET 10 SDK; no additional NuGet
packages have been added yet. References used:

| Reference                                               | Purpose                                |
| ------------------------------------------------------- | -------------------------------------- |
| `Microsoft.AspNetCore.Authentication.JwtBearer`         | JWT validation middleware              |
| `Microsoft.IdentityModel.Tokens` / `System.IdentityModel.Tokens.Jwt` | JWT token generation      |
| `Microsoft.AspNetCore.Http.Features`                    | `IFormFile` for multipart uploads (Round 25) |

Planned:
- `BCrypt.Net-Next` when password hashing is upgraded from HMAC-SHA256
  (security review, Round 56).
- `Microsoft.AspNetCore.Authentication.Google` for Gmail sign-in.
- `StackExchange.Redis` if/when the PBAC permission cache moves off
  `IMemoryCache` to a shared store (multi-instance only).

---

## Current state

As of 2026-06-02, foundation work is complete and the first feature
module (My Profile) is underway.

| Area                                   | State                    |
| -------------------------------------- | ------------------------ |
| Backend API, JSON store, JWT auth      | Complete                 |
| React migration to TypeScript (strict) | Complete                 |
| Server-state layer (TanStack Query)    | Complete                 |
| Routing layer (data router, typed URLs) | Complete                |
| Forms (RHF + Zod)                      | Complete                 |
| Auth hardening (refresh, first-login, route guards) | Complete (one follow-up) |
| Styling (Tailwind)                     | Complete                 |
| Client state (Zustand)                 | Complete                 |
| Feature: My Profile (Round 23)         | In progress (23.1–23.4 done) |

Auth hardening detail: refresh-token rotation (20.1), axios refresh
interceptor (20.2), User-into-Employee aggregate consolidation (20.3,
merged 2026-05-27), forced first-login password change (20.4), and
role-based route guards (20.5) are complete. The useAuth narrowing
capstone (20.6) is done except for one open step (an `auth?` reference
that could not be located — tracked in `CHALLENGES.md`).

Styling: Round 21 — Tailwind refactor, design tokens, dark mode, and
`@apply` button patterns — is complete. Client state: Round 22 is
complete — theme and recent-activity stores migrated to Zustand with
`persist` + `devtools` middleware and `useShallow` selectors. Feature
modules have begun: Round 23 (My Profile) is underway with 23.1–23.4
done (types, `useProfile`/`useUpdateProfile` hooks, display page, and the
RHF + Zod edit page); 23.5 (avatar upload) is next.

Detailed per-task history is tracked in [`CHALLENGES.md`](./CHALLENGES.md).

---

## Module roadmap

Modules are grouped into two phases. Each module includes both the API
endpoints and the corresponding client views.

### Phase 1 — Core HR functionality

| Module               | Scope                                                       |
| -------------------- | ----------------------------------------------------------- |
| My Profile           | Employee self-service: a non-admin user sees only their OWN record (not the full grid) and may edit only email and contact number; all other fields read-only |
| Change Password      | Authenticated password change; first-login forced reset     |
| Account lifecycle    | Inactive employees are rejected at login (and on token refresh) |
| External sign-in     | Google (Gmail) sign-in for pre-provisioned accounts only; no self-registration; Gmail users skip the forced first-login password change |
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

Permission-based access control (PBAC) — migrate authorization from
roles to permissions. Planned shape: keep the role (and user identity) in
the JWT, resolve role→permissions per request through a cache
(`IMemoryCache`, swappable to Redis behind an `IPermissionCache`
interface when multi-instance), and enforce via ASP.NET policy-based
authorization (`PermissionAuthorizationPolicyProvider` + handler, e.g.
`[Authorize("Employee.Edit")]`). This gives instant permission revocation
without forcing token refresh and avoids JWT bloat.

Other platform work: real-time updates (SignalR), automated testing
(unit, integration, E2E), accessibility audit, performance pass,
internationalization, offline / PWA support, build tooling migration to
Vite, Storybook for component documentation, animation primitives, CI/CD
pipeline, containerization, monorepo restructure, server-side rendering
evaluation, security review, responsive/mobile pass, design-system
primitives.

---

## Timeline

Dates are target windows, not commitments.

**Basis (re-estimated 2026-06-02):** 282 challenges total, 82 complete
(through 23.4), **200 remaining**. The original "mid-December" estimate
assumed one challenge per day. Observed cadence is higher — 8 challenges
(22.2 → 23.4) were completed on 2026-06-02, and per-task targets are
consistently beaten by 50–75%. The estimate below assumes a sustained
average of **~3 challenges per active day (~15/week)**, which is between
the observed burst rate and a conservative steady pace.

| Milestone                          | Target (~15/week)   |
| ---------------------------------- | ------------------- |
| Foundation complete                | Done (2026-06-02)   |
| Round 30 (Leave approval flow)     | Mid–late June 2026  |
| Phase 1 modules complete (~Rd 40)  | Mid-July 2026       |
| Phase 2 platform work complete     | Early September 2026 |

Sensitivity to cadence (200 remaining, every-calendar-day basis):

| Pace            | Project complete    |
| --------------- | ------------------- |
| 1 / day         | ~Mid-December 2026  |
| 2 / day         | ~Mid-September 2026 |
| 3 / day         | ~Early August 2026  |
| 4 / day         | ~Late July 2026     |

Net effect: maintaining the current pace pulls completion forward by
roughly three months versus the original plan — into **late summer /
early autumn 2026** rather than December. Heavier rounds later (the
90-minute capstone slice in 60.3, E2E and a11y passes) will absorb some
of that gain.

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
