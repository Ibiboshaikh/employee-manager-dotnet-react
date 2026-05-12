// ============================================================================
// APP.JS — The root component of the React application.
//
// This is the "main layout" of your app. Its job:
// 1. Set up ROUTING — which URL shows which component (page)
// 2. Set up TOAST NOTIFICATIONS — the popup messages (success/error)
//
// ROUTING STRUCTURE:
//   /login              → Login page (public — anyone can access)
//   /employees          → Employee list (protected — requires JWT token)
//   /employees/new      → Create employee form (protected)
//   /employees/edit/:id → Edit employee form (protected)
//   /*                  → Any other URL → redirects to /employees
//
// HOW PROTECTED ROUTES WORK:
// <Route element={<ProtectedRoute />}>  ← This is a "layout route"
//   <Route path="/employees" ... />     ← These are nested "child routes"
// </Route>
//
// ProtectedRoute checks for a JWT token. If found, it renders <Outlet />
// which displays the matching child route. If no token, it redirects to /login.
//
// ANALOGY TO .NET:
// This is like Program.cs + routing setup — it defines the app's structure
// and which "controller" (component) handles which URL path.
// ============================================================================

// ── IMPORTS ────────────────────────────────────────────────────────────────

// React is the core library. We need it for JSX to work.
import React from "react";

// React Router — handles navigation between pages WITHOUT page reloads.
// BrowserRouter: wraps the whole app to enable routing
// Routes: container for all <Route> definitions
// Route: maps a URL path to a component
// Navigate: redirects to a different URL (like RedirectToAction in .NET)
import {
  BrowserRouter as Router, // Renamed to "Router" for cleaner JSX
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// React Toastify — shows popup notification messages.
// ToastContainer is a component that renders the popup container.
// Individual components call toast.success() or toast.error() to show popups.
import { ToastContainer } from "react-toastify";

// Toastify's CSS — required for the popup notifications to look correct.
// Without this import, toasts would appear but look broken (no styling).
import "react-toastify/dist/ReactToastify.css";

// Our application components (each one is a "page" in the app)
import Login from "./components/Login";              // Login page
import EmployeeList from "./components/EmployeeList"; // Employee dashboard
import EmployeeForm from "./components/EmployeeForm"; // Create/Edit form
import ProtectedRoute from "./components/ProtectedRoute"; // Auth guard

// ── THE APP COMPONENT ──────────────────────────────────────────────────────

// This is a functional component — a JavaScript function that returns JSX.
// React calls this function to get the UI, then renders it into the DOM.
function App() {
  return (
    // <Router> (BrowserRouter) enables routing for the entire app.
    // It uses the browser's URL bar to determine which component to show.
    // Everything that uses routing (Links, Routes, useNavigate) must be inside this.
    <Router>

      {/* ── TOAST NOTIFICATION CONTAINER ────────────────────────────────
          This renders an invisible container in the top-right corner.
          When any component calls toast.success("message"), a popup
          appears here and auto-closes after 3000ms (3 seconds).

          position: where on screen the toast appears
          autoClose: milliseconds before the toast disappears (3000 = 3 seconds) */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── ROUTE DEFINITIONS ───────────────────────────────────────────
          <Routes> is like a switch statement — it matches the current URL
          to the first matching <Route> and renders that component.

          Only ONE route matches at a time (first match wins). */}
      <Routes>

        {/* PUBLIC ROUTE — anyone can access this, no token needed.
            When URL is "/login", render the Login component. */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES — wrapped in ProtectedRoute.
            ProtectedRoute checks localStorage for a JWT token.
            - If token exists → renders <Outlet /> (which shows the child route)
            - If no token → redirects to /login

            This is a "layout route" — it doesn't have a path, it just wraps
            its children with authentication logic. */}
        <Route element={<ProtectedRoute />}>
          {/* These routes are "children" of ProtectedRoute.
              They only render if ProtectedRoute allows them to. */}
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<EmployeeForm />} />

          {/* :id is a URL PARAMETER — it captures whatever value is in that position.
              Example: /employees/edit/abc123 → id = "abc123"
              The component reads it with: const { id } = useParams();
              This is like [HttpGet("{id}")] in .NET controllers. */}
          <Route path="/employees/edit/:id" element={<EmployeeForm />} />
        </Route>

        {/* CATCH-ALL ROUTE — if URL doesn't match any route above,
            redirect to /employees. The "*" means "match anything".
            replace={true} prevents this redirect from adding to browser history
            (so the back button doesn't get stuck in a redirect loop). */}
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Routes>
    </Router>
  );
}

// Export this component so index.js can import and render it.
// "export default" means this is the MAIN export of this file.
// Other files import it as: import App from './App';
export default App;
