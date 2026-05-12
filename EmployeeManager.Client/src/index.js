// ============================================================================
// INDEX.JS — The entry point of the React application.
//
// This file is the FIRST JavaScript code that runs. Its only job:
// 1. Find the <div id="root"> in index.html
// 2. Tell React to render your App component inside it
//
// Think of it like Program.cs in .NET — it's the "main" function that starts everything.
//
// EXECUTION ORDER:
//   Browser loads index.html
//     → Browser loads this file (index.js)
//       → This file mounts <App /> into <div id="root">
//         → App.js renders the router and decides which page to show
// ============================================================================

// Import the React library — needed for JSX to work
// Even though we don't explicitly use "React" in this file,
// JSX (<App />) is secretly converted to React.createElement() calls
import React from 'react';

// ReactDOM is the "bridge" between React and the actual browser DOM.
// React creates a virtual representation of the UI, and ReactDOM
// turns that into real HTML elements in the browser.
import ReactDOM from 'react-dom/client';

// Import global CSS styles — these apply to the entire app.
// In CSS, import order matters: index.css is loaded first (base styles),
// then App.css (loaded via App.js) can override/extend them.
import './index.css';

// Import the root component of our application.
// This is where routing, layout, and all other components are defined.
import App from './App';

// Performance monitoring utility (optional, not critical for the app).
// You can pass a function like console.log to measure render performance.
import reportWebVitals from './reportWebVitals';

// ── STEP 1: Create a React "root" ──────────────────────────────────────────
// Find the DOM element with id="root" (from index.html)
// and create a React root — this is where React will render everything.
//
// createRoot() is the modern way to initialize React (React 18+).
// Older code uses: ReactDOM.render(<App />, document.getElementById('root'))
const root = ReactDOM.createRoot(document.getElementById('root'));

// ── STEP 2: Render the App component ───────────────────────────────────────
// root.render() tells React: "Take this component tree and display it."
//
// <React.StrictMode> is a development-only wrapper that:
// - Warns you about deprecated features
// - Runs effects twice in development to catch bugs (not in production)
// - Highlights potential problems in your code
// It does NOT affect the production build at all.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: measure performance metrics (First Contentful Paint, etc.)
// Pass console.log to see results: reportWebVitals(console.log)
// Or send to an analytics service. Not critical — can be removed.
reportWebVitals();
