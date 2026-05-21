// ============================================================================
// App.tsx — The root component of the React application.
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

// React Router — handles navigation between pages WITHOUT page reloads.
// BrowserRouter: wraps the whole app to enable routing
// Routes: container for all <Route> definitions
// Route: maps a URL path to a component
// Navigate: redirects to a different URL (like RedirectToAction in .NET)
// import {
//   BrowserRouter as Router, // Renamed to "Router" for cleaner JSX
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// React Toastify — shows popup notification messages.
// ToastContainer is a component that renders the popup container.
// Individual components call toast.success() or toast.error() to show popups.
import { ToastContainer } from "react-toastify";
import { routes } from "./routes"; 
// Toastify's CSS — required for the popup notifications to look correct.
// Without this import, toasts would appear but look broken (no styling).
import "react-toastify/dist/ReactToastify.css";

// Global app styles (CSS reset, modal overlay, etc.)
import "./App.css";

// Our application components (each one is a "page" in the app)
import Login from "./components/Login";              // Login page
import EmployeeList from "./components/EmployeeList"; // Employee dashboard
import EmployeeForm from "./components/EmployeeForm"; // Create/Edit form
import ProtectedRoute from "./components/ProtectedRoute"; // Auth guard
import ErrorBoundary from "./components/ErrorBoundary";
import  AuthLayout  from "./Context/AuthLayout";
const router = createBrowserRouter([
  {
    path: routes.login(),
    element: <Login />,
  },
  {
    element: <ProtectedRoute />, // This layout wraps all protected routes
    children: [
      {
        element: <AuthLayout />, // This layout wraps all employee-related routes
        children: [
          {
            path: routes.employees(),
            element: <EmployeeList />,
          },
          {
            path: routes.newEmployee(),
            element: <EmployeeForm />,
          },
          {
            path: "/employees/:id/edit",
            element: <EmployeeForm />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={routes.employees()} replace />,
  },
]);



// ── THE APP COMPONENT ──────────────────────────────────────────────────────

// This is a functional component — a JavaScript function that returns JSX.
// React calls this function to get the UI, then renders it into the DOM.
function App() {
  return (
    // <Router> (BrowserRouter) enables routing for the entire app.
    // It uses the browser's URL bar to determine which component to show.
    // Everything that uses routing (Links, Routes, useNavigate) must be inside this.
    <ErrorBoundary>
      <ToastContainer position="top-right" autoClose={3000} />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

// Export this component so index.tsx can import and render it.
// "export default" means this is the MAIN export of this file.
// Other files import it as: import App from './App';
export default App;