# EmployeeManager

> A full-stack learning project: **ASP.NET Core 10** Web API + **React 19** SPA,
> structured as Clean Architecture with custom hooks for filtering, sorting,
> and pagination.

A self-directed project built to deepen frontend fluency by applying familiar
.NET architecture patterns on the client side. Built incrementally through
written challenges rather than tutorials — see [CHALLENGES.md](./CHALLENGES.md)
for the full progression.

---

## Tech Stack

**Backend** — ASP.NET Core 10, C#, Clean Architecture (Domain → Application →
Infrastructure → API), JWT auth with BCrypt, JSON file persistence with atomic
read-modify-write, Serilog structured logging.

**Frontend** — React 19, JavaScript (ES2022+), React Router v6, Axios with
JWT interceptor, react-toastify. Custom hooks: `useEmployees`, `useFilter`,
`useSort`, `usePagination`, `useDebounce`.

**Tooling** — .NET 10 SDK, Node.js 18+, VS Code, Postman.

---

## Features

- **Auth** — JWT login, protected routes, automatic 401 → redirect-to-login on token expiry
- **Employee CRUD** — list, create, edit, delete with optimistic UI feedback
- **Composable filters** — text search across name/email/department, department dropdown, salary range, hide-low-salary toggle — all chain cleanly
- **Sorting** — click any column header, multi-direction toggle
- **Pagination** — 10 per page, derived-not-stored, auto-resets to page 1 on filter change
- **Form validation** — per-field error display, disabled-on-submit state
- **Toasts** — success / error feedback on every operation

---

## Architecture

```
EmployeeManager/
├── EmployeeManager.Domain/         Entities + repository contracts (depends on nothing)
├── EmployeeManager.Application/    Service contracts + business rules (depends on Domain)
├── EmployeeManager.Infrastructure/ JSON-file persistence (depends on Domain)
├── EmployeeManager.API/            HTTP layer, DI wiring, JWT, CORS (depends on all above)
└── EmployeeManager.Client/         React SPA (independent project)
```

Dependencies point inward. Swapping JSON persistence for SQL is a one-line DI
change in `Program.cs`. Full architectural deep-dive in
[ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Getting Started

**Prerequisites**: .NET 10 SDK, Node.js 18+

```bash
# 1. Backend (port 5000)
cd EmployeeManager.API
dotnet run

# 2. Frontend (port 3000, proxies API to 5000)
cd EmployeeManager.Client
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).
Default login: `admin` / `admin123`.

> **Note**: the JWT secret in `appsettings.json` is a demo placeholder. For
> real use, override it via environment variables or .NET user secrets.

---

## Why I Built This

After a decade of .NET backend work, I wanted to internalize the React mental
model — not just copy from tutorials, but understand state, effects, and
component composition the same way I understand DI, services, and middleware
on the .NET side.

The challenges in [CHALLENGES.md](./CHALLENGES.md) were written to force
reasoning about each concept before reaching for a reference. Logic-solo was
the bar; syntax reference allowed when the only rust was at the syntax layer,
not the model.

The project doubles as practice for full-stack ownership: the same Clean
Architecture discipline applied to both ends of the stack.

---

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) — layer-by-layer breakdown, request journey, JWT flow, file-by-file reference
- [REACT-GUIDE.md](./REACT-GUIDE.md) — React concepts mapped to .NET equivalents
- [CHALLENGES.md](./CHALLENGES.md) — incremental hands-on challenges with timing notes
- [STUDY-GUIDE.md](./STUDY-GUIDE.md) — VS Code-centric study plan

---

## License

MIT
