// ============================================================================
// API.JS — Centralized HTTP client for ALL communication with the .NET API.
//
// This file creates a configured Axios instance that:
// 1. Has a base URL pointing to our .NET API (localhost:5000)
// 2. Automatically attaches the JWT token to every request
// 3. Automatically handles expired tokens (401 → redirect to login)
// 4. Exports clean functions for each API endpoint
//
// WHY CENTRALIZE API CALLS?
// Instead of writing "fetch('http://localhost:5000/api/employee')" in every
// component, we write it ONCE here. Components just call getEmployees().
// If the API URL changes, we only update it in ONE place.
//
// ANALOGY TO .NET:
// This is like creating a typed HttpClient with a base address and
// a DelegatingHandler that adds Authorization headers automatically.
//
// FLOW: React Component → calls function here → Axios sends HTTP request
//       → .NET API processes it → sends response → Axios returns it
//       → Component uses the data
// ============================================================================

// Axios is an HTTP client library — similar to HttpClient in C#.
// It makes HTTP requests (GET, POST, PUT, DELETE) and returns promises.
// Advantages over browser's fetch(): automatic JSON parsing, interceptors, cleaner API.
import axios from "axios";

// ── CREATE AXIOS INSTANCE ──────────────────────────────────────────────────
// axios.create() creates a custom instance with pre-configured settings.
// All requests made through this instance will use these settings.
const api = axios.create({
  baseURL: "/api",
  // ^^^ Using a RELATIVE URL instead of hardcoding "http://localhost:5000/api".
  //
  // In DEVELOPMENT: The React dev server (port 3000) proxies "/api/*" requests
  //   to "http://localhost:5000" via the "proxy" setting in package.json.
  //   So api.get("/employee") → React dev server → http://localhost:5000/api/employee
  //
  // In PRODUCTION: The React build is served from the .NET API's wwwroot/ folder,
  //   so "/api/employee" naturally hits the same server — no proxy needed.
  //
  // WHY? Hardcoding URLs breaks across environments (dev, staging, prod).
  //   Relative URLs + proxy is the enterprise-standard pattern.
});

// ── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
// An interceptor runs BEFORE every HTTP request is sent.
// We use it to automatically attach the JWT token to every request.
//
// Without this, we'd have to manually add the token in every component:
//   axios.get('/employee', { headers: { Authorization: `Bearer ${token}` } })
//
// With the interceptor, it happens automatically for ALL requests.
//
// ANALOGY: Like a DelegatingHandler in .NET HttpClient pipeline.
api.interceptors.request.use((config) => {
  // Read the JWT token from localStorage (saved there during login)
  const token = localStorage.getItem("token");

  // If a token exists, add it to the Authorization header
  if (token) {
    // "Bearer" is the authentication scheme for JWT tokens.
    // The .NET API expects: Authorization: Bearer eyJhbGci...
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Return the config — Axios needs this to proceed with the request.
  // If you don't return it, the request will fail.
  return config;
});

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────
// An interceptor that runs AFTER every HTTP response is received.
// We use it to detect expired/invalid tokens (HTTP 401 Unauthorized).
//
// When the .NET API returns 401, it means:
// - The JWT token has expired (tokens expire after 24 hours)
// - The token is invalid or tampered with
// - No token was sent at all
//
// In any of these cases, we clear the stored auth data and force a login.
api.interceptors.response.use(
  // SUCCESS handler — if the response is 2xx, just pass it through unchanged.
  (response) => response,

  // ERROR handler — if the response is an error (4xx, 5xx), check if it's 401.
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clear all auth data from localStorage
      localStorage.removeItem("token"); // Remove the JWT token
      localStorage.removeItem("user");  // Remove the user info (name, role)

      // Force redirect to login page.
      // We use window.location.href instead of React's navigate() because
      // this interceptor runs OUTSIDE of React's component tree —
      // we don't have access to React hooks here.
      window.location.href = "/login";
    }

    // Re-throw the error so the calling component's catch block can handle it.
    // Without this, errors would be silently swallowed.
    return Promise.reject(error);
  }
);

// ── AUTH API CALLS ─────────────────────────────────────────────────────────

/**
 * Login — sends username and password to the .NET API.
 *
 * @param {Object} credentials - { username: string, password: string }
 * @returns {Promise} - Resolves with { data: { token, fullName, role } }
 *
 * Usage in Login.js:
 *   const response = await login({ username: 'admin', password: 'admin123' });
 *   const token = response.data.token;
 *
 * Maps to: POST http://localhost:5000/api/auth/login
 * .NET endpoint: AuthController.Login()
 */
export const login = (credentials) => api.post("/auth/login", credentials);

// ── EMPLOYEE CRUD API CALLS ────────────────────────────────────────────────
// Each function maps to one REST endpoint on the .NET EmployeeController.
// They all return Promises (because HTTP requests are asynchronous).
// Components use async/await to call them: const response = await getEmployees();

/**
 * Get All Employees — fetches the complete employee list.
 *
 * @returns {Promise} - Resolves with { data: Employee[] }
 *
 * Maps to: GET http://localhost:5000/api/employee
 * .NET endpoint: EmployeeController.GetAll()
 */
export const getEmployees = () => api.get("/employee");

/**
 * Get Single Employee — fetches one employee by ID.
 *
 * @param {string} id - The employee's GUID (e.g., "a1b2c3d4-...")
 * @returns {Promise} - Resolves with { data: Employee }
 *
 * Maps to: GET http://localhost:5000/api/employee/{id}
 * .NET endpoint: EmployeeController.GetById(Guid id)
 */
export const getEmployee = (id) => api.get(`/employee/${id}`);
//                                          ^^^ Template literal — embeds the id variable into the URL string

/**
 * Create Employee — sends a new employee to be saved.
 *
 * @param {Object} employee - { firstName, lastName, email, department, ... }
 * @returns {Promise} - Resolves with { data: Employee } (includes generated ID)
 *
 * Maps to: POST http://localhost:5000/api/employee
 * .NET endpoint: EmployeeController.Create(Employee employee)
 */
export const createEmployee = (employee) => api.post("/employee", employee);
//                                                    ^^^ URL     ^^^ request body (sent as JSON automatically)

/**
 * Update Employee — sends updated data for an existing employee.
 *
 * @param {string} id - The employee's GUID
 * @param {Object} employee - Updated employee data
 * @returns {Promise} - Resolves with { data: Employee }
 *
 * Maps to: PUT http://localhost:5000/api/employee/{id}
 * .NET endpoint: EmployeeController.Update(Guid id, Employee employee)
 */
export const updateEmployee = (id, employee) =>
  api.put(`/employee/${id}`, employee);

/**
 * Delete Employee — removes an employee by ID.
 *
 * @param {string} id - The employee's GUID
 * @returns {Promise} - Resolves with 204 No Content (empty response)
 *
 * Maps to: DELETE http://localhost:5000/api/employee/{id}
 * .NET endpoint: EmployeeController.Delete(Guid id)
 */
export const deleteEmployee = (id) => api.delete(`/employee/${id}`);

// Export the axios instance as default (in case someone needs direct access)
export default api;