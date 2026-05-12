# Architecture Reference

In-depth architecture, request flow, and component documentation for the
EmployeeManager project. For a quick overview and how to run, see [README.md](./README.md).

================================================================================
1. PROJECT ARCHITECTURE
================================================================================

## Solution Structure

    EmployeeManager/                          <-- Solution root
    |
    |-- EmployeeManager.slnx                  Solution file
    |-- README.md                             Quick overview
    |-- ARCHITECTURE.md                       This file
    |-- REACT-GUIDE.md                        React concepts mapped to .NET
    |
    |-- EmployeeManager.API/                  <-- HTTP layer (backend)
    |   |-- Controllers/
    |   |   |-- AuthController.cs             Login endpoint
    |   |   |-- EmployeeController.cs         CRUD endpoints
    |   |-- Program.cs                        App startup, DI, JWT, CORS
    |   |-- appsettings.json                  Configuration
    |
    |-- EmployeeManager.Client/               <-- React frontend (separate project)
    |   |-- public/
    |   |   |-- index.html                    The single HTML page
    |   |-- src/
    |   |   |-- index.js                      Entry point
    |   |   |-- App.js                        Root component (routes)
    |   |   |-- services/
    |   |   |   |-- api.js                    HTTP client with JWT interceptor
    |   |   |-- components/
    |   |       |-- Login.js                  Login page
    |   |       |-- ProtectedRoute.js         Auth guard
    |   |       |-- EmployeeList.js           Employee dashboard
    |   |       |-- EmployeeForm.js           Create/Edit form
    |   |-- package.json                      Dependencies and npm scripts
    |
    |-- EmployeeManager.Domain/               <-- Core layer (no dependencies)
    |   |-- Models/
    |   |   |-- Employee.cs                   Employee entity
    |   |   |-- User.cs                       User entity
    |   |   |-- LoginRequest.cs               Login DTOs
    |   |-- Repositories/
    |       |-- IEmployeeRepository.cs        Data access contract
    |       |-- IUserRepository.cs            Data access contract
    |
    |-- EmployeeManager.Application/          <-- Business logic layer
    |   |-- Services/
    |       |-- IEmployeeService.cs           Business logic contract
    |       |-- EmployeeService.cs            Validation, rules
    |       |-- IAuthService.cs               Auth logic contract
    |       |-- AuthService.cs                JWT, password hashing
    |
    |-- EmployeeManager.Infrastructure/       <-- Data access layer
        |-- Data/
        |   |-- JsonDataStore.cs              Generic JSON file reader/writer
        |-- Repositories/
            |-- EmployeeRepository.cs         Reads/writes employees.json
            |-- UserRepository.cs             Reads/writes users.json


## How the Layers Connect

- Domain (innermost)
  - Depends on: NOTHING
  - Contains: Models (Employee, User) and repository interfaces
  - Purpose: Defines WHAT things look like and WHAT operations exist

- Application
  - Depends on: Domain only
  - Contains: Service interfaces and implementations
  - Purpose: Business rules like "salary cant be negative", "emails must be unique"

- Infrastructure
  - Depends on: Domain only
  - Contains: Repository implementations and JsonDataStore
  - Purpose: Actually reads/writes data to JSON files

- API (outermost)
  - Depends on: Domain, Application, and Infrastructure
  - Contains: Controllers, Program.cs, configuration
  - Purpose: Receives HTTP requests, returns responses

THE DEPENDENCY RULE: Dependencies point INWARD.
API --> Application --> Domain <-- Infrastructure
Domain depends on nobody.


## Why Separate Projects?

- Domain = Company rules and forms
  Defines WHAT things look like and WHAT operations exist

- Application = Business managers
  Contains rules like "salary cant be negative"

- Infrastructure = IT department
  Actually reads/writes data. Can be swapped for SQL Server later

- API = Reception desk
  Receives requests, passes them to the right department, sends responses back

To swap from JSON files to SQL Server, you only change ONE line in Program.cs:

    // Before:
    builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
    // After:
    builder.Services.AddScoped<IEmployeeRepository, SqlEmployeeRepository>();


## React Frontend (EmployeeManager.Client)

The React app lives in its own folder at the solution root — a sibling to the
.NET projects, not nested inside the API. This is the enterprise-standard
approach: frontend and backend are independent applications that communicate
over HTTP.

In development, the React dev server (port 3000) proxies API calls to the
.NET backend (port 5000) via the "proxy" setting in package.json. The React
code uses relative URLs ("/api/...") so it works in both dev and production.


================================================================================
2. BACKEND EXPLAINED
================================================================================

## The Request Journey

When the React frontend sends a request like GET /api/employee:

  1. HTTP request arrives at the .NET API
  2. Serilog logs the request
  3. CORS checks if localhost:3000 is allowed
  4. Authentication middleware validates the JWT token
  5. Authorization checks the [Authorize] attribute
  6. Controller receives the request, calls the Service
  7. Service applies business rules, calls the Repository
  8. Repository reads data from the JSON file
  9. Data flows back up: Repository --> Service --> Controller
  10. Controller returns HTTP 200 OK with JSON body


## Dependency Injection (DI)

In Program.cs, we wire up which class implements which interface:

    builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
    builder.Services.AddScoped<IEmployeeService, EmployeeService>();

This means: "When any class asks for IEmployeeRepository, create an
EmployeeRepository and hand it over."


## API Endpoints

  POST   /api/auth/login        -- Login, returns JWT token (no auth needed)
  GET    /api/employee          -- List all employees (auth required)
  GET    /api/employee/{id}     -- Get one employee (auth required)
  POST   /api/employee          -- Create employee (auth required)
  PUT    /api/employee/{id}     -- Update employee (auth required)
  DELETE /api/employee/{id}     -- Delete employee (auth required)


================================================================================
3. FRONTEND EXPLAINED
================================================================================

## How the React App Starts

  1. Browser loads index.html (has an empty <div id="root">)
  2. Browser loads the bundled JavaScript
  3. index.js runs and mounts <App /> into the root div
  4. App.js checks the URL and renders the matching component
  5. If URL is /login --> React renders the Login component
  6. If URL is /employees --> ProtectedRoute checks token, then renders EmployeeList


## Routes (Pages)

  /login              -->  Login component (no auth required)
  /employees          -->  EmployeeList component (auth required)
  /employees/new      -->  EmployeeForm in create mode (auth required)
  /employees/edit/:id -->  EmployeeForm in edit mode (auth required)
  /* (anything else)  -->  Redirects to /employees


## Custom Hooks

  - useEmployees    -- Owns employee list state and CRUD operations
  - useFilter       -- Filter chain: text search + department + salary range
  - useSort         -- Column sorting with multi-direction toggle
  - usePagination   -- Page state, derived totalPages and paginated slice
  - useDebounce     -- Debounces fast-changing input (search box)

Each hook is an importable JS module exposing state + handlers. Calling
components get their own state instance — not a shared utility. The mental
model maps cleanly to .NET: a hook is a factory for scoped state and behavior,
analogous to a service registered as Transient in DI.


================================================================================
4. HOW BACKEND AND FRONTEND CONNECT
================================================================================

## The Communication Flow

  In development (two separate servers):
  1.  React component calls getEmployees() from api.js
  2.  Axios sends GET /api/employee (relative URL) with JWT token in the header
  3.  React dev server proxy forwards the request to http://localhost:5000
  4.  .NET JWT middleware validates the token
  5.  EmployeeController.GetAll() is called
  6.  Service calls Repository, which reads the JSON file
  7.  Controller returns a JSON array in the response body
  8.  Response flows back through the proxy to Axios
  9.  response.data contains the employee array
  10. setEmployees(response.data) updates React state
  11. React re-renders the table with the new data

  In production (single server):
  - The React build output goes into the .NET API's wwwroot/ folder
  - Both the UI and API are served from the same origin (no proxy needed)
  - Relative URLs ("/api/...") naturally hit the same server


## CORS - Why It Is Needed

CORS (Cross-Origin Resource Sharing) is a browser security feature.

  - React runs on localhost:3000
  - .NET API runs on localhost:5000
  - Different ports = different "origins"
  - Browsers BLOCK cross-origin requests by default

The .NET API explicitly allows React's origin in Program.cs:

    policy.WithOrigins("http://localhost:3000")
          .AllowAnyHeader()
          .AllowAnyMethod();

NOTE: The React dev server proxy bypasses CORS (proxied requests come from
the server, not the browser). But CORS is still configured as a safety net
and for tools like Postman or other clients.


================================================================================
5. AUTHENTICATION FLOW (JWT)
================================================================================

## Login Flow

  1. User types credentials and clicks "Sign In"
  2. React sends POST /api/auth/login with { username, password }
  3. AuthController receives the request
  4. AuthService finds the user in users.json
  5. AuthService hashes the password and compares to the stored hash
  6. If valid, AuthService generates a signed JWT token
  7. API returns { token, fullName, role }
  8. React saves token and user info in localStorage
  9. React navigates to /employees


## Authenticated Request Flow

  1. React component calls getEmployees()
  2. Axios interceptor reads token from localStorage
  3. Axios adds "Authorization: Bearer {token}" header to the request
  4. .NET JWT middleware validates the token signature and expiry
  5. [Authorize] attribute passes
  6. Controller method runs and returns data


## Token Expiration Flow

  1. React sends a request with an expired token
  2. .NET JWT middleware rejects it, returns 401 Unauthorized
  3. Axios response interceptor catches the 401
  4. Clears localStorage (token and user info)
  5. Redirects the browser to /login


================================================================================
6. FILE-BY-FILE REFERENCE
================================================================================

## Backend Files

  Program.cs                -- App entry point. Configures DI, JWT, CORS, middleware
  AuthController.cs         -- POST /api/auth/login endpoint
  EmployeeController.cs     -- CRUD endpoints for employees (all require auth)
  IAuthService.cs           -- Contract for login and seed operations
  AuthService.cs            -- Validates credentials, generates JWT, hashes passwords
  IEmployeeService.cs       -- Contract for employee business operations
  EmployeeService.cs        -- Business rules: unique emails, positive salary
  IEmployeeRepository.cs    -- Contract for employee data access
  IUserRepository.cs        -- Contract for user data access
  Employee.cs               -- Employee model (Id, FirstName, LastName, Email, etc.)
  User.cs                   -- User model (Id, Username, PasswordHash, Role)
  LoginRequest.cs           -- DTOs for login request and response
  EmployeeRepository.cs     -- Reads/writes employees to JSON file
  UserRepository.cs         -- Reads/writes users to JSON file
  JsonDataStore.cs          -- Generic thread-safe JSON file reader/writer
                               (ReadModifyWriteAsync for atomic updates)


## Frontend Files (EmployeeManager.Client/)

  index.html            -- The single HTML page with <div id="root">
  index.js              -- Entry point: mounts React into the HTML page
  App.js                -- Root component: defines all routes
  App.css               -- Global CSS reset
  index.css             -- Base font styles
  api.js                -- Centralized HTTP client with JWT interceptor
                           Uses relative URLs + proxy (no hardcoded localhost)
  Login.js              -- Login form: authenticates and saves JWT
  ProtectedRoute.js     -- Route guard: redirects to login if no token
  EmployeeList.js       -- Dashboard: fetches and displays all employees
  EmployeeForm.js       -- Dual-mode form: creates or edits employees
  package.json          -- Dependencies, scripts, and proxy config


================================================================================
7. EXTENDING THE PROJECT
================================================================================

## Add a new field to Employee

  1. Domain: Add the property to Employee.cs
  2. Frontend Form: Add to the useState initial object in EmployeeForm.js
  3. Frontend Form: Add an input element for it
  4. Frontend Table: Add a <th> and <td> in EmployeeList.js
  5. Rebuild backend: dotnet build


## Add a new API endpoint

  1. Domain: Add method to repository interface (if new data access needed)
  2. Infrastructure: Implement the method in the repository class
  3. Application: Add method to service interface and implementation
  4. API: Add action method in the controller
  5. Frontend: Add API function in api.js, call it from a component


## Add a new page in React

  1. Create a new component file in src/components/
  2. Add a <Route> for it in App.js
  3. Use navigate('/new-page') to go to it from other components
