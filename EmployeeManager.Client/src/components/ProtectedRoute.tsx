// ============================================================================
// ProtectedRoute.tsx — Authentication guard for protected pages.
//
// This component acts as a "security gate" for routes that require login.
// It checks if a JWT token exists in localStorage:
//   - Token EXISTS → allow access (render the child page)
//   - Token MISSING → redirect to login page
//
// HOW IT'S USED (in App.tsx):
//   <Route element={<ProtectedRoute />}>       ← This is the guard
//     <Route path="/employees" element={<EmployeeList />} />  ← Protected page
//     <Route path="/employees/new" element={<EmployeeForm />} />
//   </Route>
//
// ANALOGY TO .NET:
// This is like the [Authorize] attribute on a controller.
// In .NET: [Authorize] checks the JWT token server-side.
// In React: ProtectedRoute checks for a token client-side.
// BOTH are needed — this prevents UI flicker, [Authorize] prevents data access.
//
// IMPORTANT: This is a CLIENT-SIDE guard only!
// Even if someone bypasses this (by manually editing localStorage),
// the .NET API will reject their requests because the token is validated server-side.
// This component is for UX (user experience), not security.
// ============================================================================

// Import React (needed for JSX)
import React from "react";

// Navigate: component that redirects to another URL (like RedirectToAction)
// Outlet: special component that renders the matching child route
import { Navigate, Outlet } from "react-router-dom";

// ── THE PROTECTEDROUTE COMPONENT ───────────────────────────────────────────
const ProtectedRoute = () => {
  // Check if a JWT token exists in localStorage.
  // localStorage.getItem() returns the token string, or null if not found.
  const token = localStorage.getItem("token");

  // ── DECISION: Allow or Redirect? ──────────────────────────────────────

  // If NO token found → user is not logged in → redirect to login page.
  if (!token) {
    // <Navigate to="/login" replace /> redirects the browser to /login.
    //
    // replace={true} is important! It replaces the current URL in browser history
    // instead of adding a new entry. Without it:
    //   User types /employees → redirected to /login → user presses Back button
    //   → goes back to /employees → redirected to /login again (infinite loop!)
    //
    // With replace={true}:
    //   /employees is REPLACED with /login in history → Back button goes to
    //   whatever page was before /employees (no loop).
    return <Navigate to="/login" replace />;
  }

  // If token EXISTS → user is logged in → render the child route.
  //
  // <Outlet /> is a special React Router component.
  // It acts as a "placeholder" that renders whichever child route matched the URL.
  //
  // For example, if the URL is /employees:
  //   <Route element={<ProtectedRoute />}>          ← ProtectedRoute renders
  //     <Route path="/employees" element={<EmployeeList />} />  ← Outlet shows THIS
  //   </Route>
  //
  // <Outlet /> becomes <EmployeeList /> in this case.
  // If URL were /employees/new, <Outlet /> would become <EmployeeForm />.
  return <Outlet />;
};

// Export the component so App.tsx can import and use it.
export default ProtectedRoute;