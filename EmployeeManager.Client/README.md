# EmployeeManager.Client - React Frontend

The React frontend for the NoviManager application.
This is a standalone project at the solution root, separate from the .NET backend.


## Prerequisites

  - Node.js v18+ (https://nodejs.org/)


## How to Run

    npm install    (only needed the first time)
    npm start

  - Runs on http://localhost:3000
  - API calls are proxied to http://localhost:5000 (configured in package.json)
  - Make sure the .NET backend is running first


## How It Connects to the Backend

  - api.js uses a RELATIVE base URL: "/api"
  - In development, the "proxy" field in package.json forwards "/api/*" requests
    to the .NET backend at http://localhost:5000
  - In production, the React build output goes into the .NET API's wwwroot/ folder
    and both UI and API are served from the same origin


## Project Structure

    src/
    |-- index.js              Entry point (mounts React into HTML)
    |-- App.js                Root component (defines routes)
    |-- App.css               Global styles
    |-- index.css             Base font styles
    |
    |-- services/
    |   |-- api.js            Centralized HTTP client with JWT interceptor
    |
    |-- components/
        |-- Login.js          Login form: authenticates and saves JWT
        |-- ProtectedRoute.js Route guard: redirects to login if no token
        |-- EmployeeList.js   Dashboard with employee table
        |-- EmployeeForm.js   Dual-mode form: creates or edits employees


## Available Scripts

    npm start       Start the dev server (port 3000)
    npm test        Run tests in watch mode
    npm run build   Build for production (output in build/ folder)
