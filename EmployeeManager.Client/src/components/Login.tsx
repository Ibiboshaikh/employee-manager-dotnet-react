// ============================================================================
// Login.tsx — The login page component.
//
// This is the FIRST page users see. It renders a username/password form
// and authenticates the user against the .NET API.
//
// COMPLETE FLOW:
// 1. User sees the login form with username and password fields
// 2. User types credentials (each keystroke updates React state)
// 3. User clicks "Sign In" → handleSubmit() is called
// 4. handleSubmit() sends POST /api/auth/login via Axios
// 5. If SUCCESS:
//    - API returns { token, fullName, role }
//    - We save the token and user info in localStorage
//    - We show a success toast: "Welcome, System Administrator!"
//    - We navigate to /employees (the dashboard)
// 6. If FAILURE:
//    - API returns 401 with { message: "Invalid username or password" }
//    - We show an error toast with the message
//    - User stays on the login page
//
// DEFAULT CREDENTIALS (created by the API on first run):
//   Username: admin
//   Password: admin123
//
// CONCEPTS DEMONSTRATED:
// - useState (managing form data)
// - Controlled components (form inputs tied to state)
// - async/await (calling the API)
// - useNavigate (programmatic navigation)
// - Event handling (onSubmit, onChange)
// - Conditional rendering (loading state)
// - Inline styles (styling without CSS files)
// ============================================================================

// ── IMPORTS ────────────────────────────────────────────────────────────────

// React: the core library. useState is a hook for managing component state.
import React, { useState } from "react";
import { isAxiosError } from 'axios';

// useNavigate: a React Router hook that returns a function to change the URL.
// It's like Response.Redirect() in .NET — it changes the page programmatically.
import { useNavigate } from "react-router-dom";

// login: our API function from api.ts that sends POST /api/auth/login.
// It's imported as a named import (with curly braces) because api.ts uses export const.
import { login } from "../services/api";
import { useAuth } from "../Context/AuthContext";
// ^^^ "../" means "go up one directory" — from components/ to src/, then into services/

// toast: a function to show popup notification messages.
// toast.success("msg") shows a green popup, toast.error("msg") shows a red one.
import { toast } from "react-toastify";

// ── THE LOGIN COMPONENT ────────────────────────────────────────────────────

// This is a "functional component" defined as an arrow function.
// Arrow functions (const X = () => {...}) and regular functions (function X() {...})
// work exactly the same in React. Arrow functions are just a style preference.
const Login = () => {

  // ── STATE DECLARATIONS ─────────────────────────────────────────────────
  // useState() creates a state variable with a getter and setter.
  // When the setter is called, React re-renders this component with the new value.

  // username: stores what the user has typed in the username field.
  // setUsername: function to update the username value.
  // "" (empty string) is the initial value.
  const [username, setUsername] = useState("");

  // password: stores what the user has typed in the password field.
  const [password, setPassword] = useState("");

  // loading: true while the login API call is in progress.
  // Used to disable the button and show "Signing in..." text.
  const [loading, setLoading] = useState(false);

  // useNavigate() returns a function that changes the URL.
  // We call navigate("/employees") to go to the employee list after login.
  const navigate = useNavigate();
  const { login: loginCredentials } = useAuth();
  // ── EVENT HANDLER: Form Submission ─────────────────────────────────────

  // This function runs when the user submits the form (clicks "Sign In" or presses Enter).
  // It's an async function because it makes an API call (which is asynchronous).
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // e is the "event object" — it contains info about what happened (which form, etc.)

    // CRITICAL: Prevent the default form behavior!
    // Without this, the browser would do a traditional form POST (full page reload)
    // which would lose all React state and navigate away. We want to handle it ourselves.
    e.preventDefault();

    // Show loading state — disables the button and changes text to "Signing in..."
    setLoading(true);

    // try/catch/finally — same pattern as C#!
    // try: attempt the API call
    // catch: handle errors (network failure, invalid credentials, etc.)
    // finally: always runs — reset loading state whether success or failure
    try {
      // Call the login API function (defined in api.ts).
      // This sends: POST http://localhost:5000/api/auth/login
      // with body: { "username": "admin", "password": "admin123" }
      //
      // await pauses execution until the API responds.
      // response.data contains the JSON body: { token, fullName, role }
      const response = await login({ username, password });
      // ^^^ { username, password } is JavaScript shorthand for { username: username, password: password }

      // ── HAND OFF TO AUTHCONTEXT ──────────────────────────────────────
      // AuthContext's login() writes token + user to localStorage AND
      // updates the global user state, so every component that reads
      // useAuth() sees the new user immediately.
      // Aliased to `loginCredentials` here because the API's `login`
      // function (imported above) shadows the same name.
      loginCredentials(response.data, response.data.token);

      // Show a green success toast popup
      toast.success(`Welcome, ${response.data.fullName}!`);
      // ^^^ Template literal (backticks) allows embedding variables with ${...}

      // Navigate to the employee list page.
      // This changes the URL to /employees and React Router renders <EmployeeList />.
      navigate("/employees");

    } catch (error) {
      // isAxiosError is a runtime type guard — if it returns true, TS narrows
      // `error` to AxiosError<{ message?: string }> inside the branch, so
      // .response?.data?.message is type-safe. The optional chains (?.) handle
      // network failures where error.response is undefined.
      const errorMessage = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Login failed. Please try again."
        : "Login failed. Please try again.";
      toast.error(errorMessage);

    } finally {
      // Always execute this, whether the login succeeded or failed.
      // Reset loading to false so the button becomes clickable again.
      setLoading(false);
    }
  };

  // ── JSX RETURN (the UI) ────────────────────────────────────────────────
  // Everything below is JSX — HTML-like syntax that React converts to DOM elements.
  // JSX differences from HTML:
  //   class → className, for → htmlFor, onclick → onClick
  //   style takes an object: style={{ color: 'red' }}
  //   JavaScript expressions go in curly braces: {variable}

  return (
    // Outer container — centers the login card on the page.
    // style={styles.container} applies the inline styles defined below.
    <div style={styles.container}>

      {/* Login card — white box with shadow */}
      <div style={styles.card}>

        {/* Title and subtitle */}
        <h2 style={styles.title}>Employee Manager V2.0</h2>
        <p style={styles.subtitle}>Sign in to continue</p>

        {/* ── THE LOGIN FORM ──────────────────────────────────────────
            onSubmit={handleSubmit} → when the form is submitted (Enter key or button click),
            call our handleSubmit function. */}
        <form onSubmit={handleSubmit}>

          {/* ── USERNAME FIELD ─────────────────────────────────────── */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"           // Text input (shows characters as typed)
              value={username}       // CONTROLLED: input's display value comes from state
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              // ^^^ CONTROLLED: every keystroke triggers onChange.
              // e.target is the <input> DOM element.
              // e.target.value is the current text in the input.
              // setUsername() updates state, causing a re-render,
              // which updates the input's value prop to match.
              //
              // THE CYCLE: User types "a" → onChange fires → setUsername("a")
              //   → React re-renders → input shows "a" from state
              //   → User types "b" → setUsername("ab") → input shows "ab"
              style={styles.input}
              placeholder="Enter username"  // Gray hint text shown when input is empty
              required                       // HTML5 validation: browser won't submit if empty
            />
          </div>

          {/* ── PASSWORD FIELD ─────────────────────────────────────── */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"        // Password input — characters shown as dots/asterisks
              value={password}        // Controlled by React state
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} // Update state on each keystroke
              style={styles.input}
              placeholder="Enter password"
              required                // Can't submit the form with an empty password
            />
          </div>

          {/* ── SUBMIT BUTTON ──────────────────────────────────────── */}
          <button
            type="submit"            // Clicking this button triggers the form's onSubmit event
            style={styles.button}
            disabled={loading}        // Disable button while API call is in progress
            // ^^^ disabled={true} makes the button unclickable and grayed out.
            // This prevents double-clicks (submitting the form twice).
          >
            {/* Conditional rendering: show different text based on loading state.
                This is a TERNARY OPERATOR: condition ? valueIfTrue : valueIfFalse
                Same as C#'s ternary: loading ? "Signing in..." : "Sign In" */}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Hint showing default credentials */}
        <p style={styles.hint}>
          Default credentials: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
};

// ── INLINE STYLES ──────────────────────────────────────────────────────────
// In React, you can style components in several ways:
// 1. CSS files (import './Login.css')
// 2. CSS Modules (import styles from './Login.module.css')
// 3. Inline styles (JavaScript objects) ← used here for simplicity
// 4. CSS-in-JS libraries (styled-components, emotion)
// 5. Utility frameworks (Tailwind CSS)
//
// Inline styles use JavaScript objects where:
// - CSS property names are camelCase: "background-color" → backgroundColor
// - Values are strings: "10px" or numbers: 10 (auto-converted to px)
// - No selectors, pseudo-classes, or media queries (limitations of inline styles)
//
// In a real project, you'd probably use CSS Modules or Tailwind CSS instead.

const styles = {
  // Container: takes full screen height and centers its child (the card)
  container: {
    display: "flex",              // Flexbox layout (enables centering)
    justifyContent: "center",     // Center horizontally
    alignItems: "center",         // Center vertically
    minHeight: "100vh",           // vh = viewport height. 100vh = full screen height
    backgroundColor: "#f0f2f5",   // Light gray background
  },

  // Card: the white box containing the form
  card: {
    backgroundColor: "white",
    padding: "40px",               // Space inside the card (between border and content)
    borderRadius: "8px",           // Rounded corners
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)", // Subtle shadow for depth effect
    //          ↑ offset-x  ↑ offset-y  ↑ blur  ↑ color (black at 10% opacity)
    width: "400px",                // Fixed width for the card
  },

  // Title: centered, dark color
  title: {
    textAlign: "center" as const,
    color: "#1a1a2e",              // Dark navy blue
    marginBottom: "5px",
  },

  // Subtitle: centered, lighter gray
  subtitle: {
    textAlign: "center" as const,
    color: "#666",                 // Medium gray
    marginBottom: "30px",          // Space before the form
  },

  // Form group: wrapper around label + input pair
  formGroup: {
    marginBottom: "20px",          // Space between form fields
  },

  // Label: styled as a block (appears above the input)
  label: {
    display: "block",              // Takes full width (label appears on its own line)
    marginBottom: "5px",           // Small gap between label and input
    fontWeight: "600",             // Semi-bold text
    color: "#333",
  },

  // Input: full-width text field with border
  input: {
    width: "100%",                 // Takes full width of its container
    padding: "10px 12px",          // Inner spacing (vertical horizontal)
    border: "1px solid #ddd",      // Light gray border
    borderRadius: "4px",           // Slightly rounded corners
    fontSize: "14px",
    boxSizing: "border-box" as const,       // Width includes padding and border
  },

  // Button: full-width, dark background, white text
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#e74c3c",    // Dark navy blue (matches title)
    color: "white",
    border: "none",                // Remove default button border
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",             // Show pointer cursor on hover
    fontWeight: "600",
  },

  // Hint: small gray text at the bottom
  hint: {
    textAlign: "center" as const,
    color: "#999",                 // Light gray
    fontSize: "12px",
    marginTop: "20px",
  },
};

// Export the Login component as the default export.
// Other files import it as: import Login from './components/Login';
export default Login;
