// ============================================================================
// EMPLOYEEFORM.JS — A dual-purpose form for CREATING and EDITING employees.
//
// This is ONE component that handles TWO tasks:
//   - CREATE MODE: URL is /employees/new → form starts empty
//   - EDIT MODE:   URL is /employees/edit/:id → form is pre-filled with existing data
//
// HOW IT DETERMINES THE MODE:
// The URL parameter ":id" tells us. In App.js, we defined:
//   <Route path="/employees/new" element={<EmployeeForm />} />        ← no :id
//   <Route path="/employees/edit/:id" element={<EmployeeForm />} />   ← has :id
//
// When useParams() returns an id → Edit mode.
// When useParams() returns undefined → Create mode.
//
// COMPLETE FLOW (Create Mode):
// 1. User clicks "+ Add Employee" → navigates to /employees/new
// 2. Component mounts → useParams() returns { id: undefined }
// 3. isEditMode = false → no data fetching
// 4. User fills in the empty form
// 5. User clicks "Create Employee" → handleSubmit calls POST /api/employee
// 6. Success → toast + navigate to /employees
//
// COMPLETE FLOW (Edit Mode):
// 1. User clicks "Edit" on an employee row → navigates to /employees/edit/{id}
// 2. Component mounts → useParams() returns { id: "some-guid" }
// 3. isEditMode = true → useEffect calls fetchEmployee(id)
// 4. API returns employee data → setFormData fills the form
// 5. User modifies fields
// 6. User clicks "Update Employee" → handleSubmit calls PUT /api/employee/{id}
// 7. Success → toast + navigate to /employees
//
// CONCEPTS DEMONSTRATED:
// - useParams (reading URL parameters)
// - useEffect with a condition (only fetch if editing)
// - Object state with useState (formData holds all fields)
// - Generic handleChange for all inputs
// - Form submission with create/update logic
// - Date formatting for HTML date inputs
// ============================================================================

// ── IMPORTS ────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";

// useNavigate: programmatic navigation (go to another page)
// useParams: read URL parameters (the :id from /employees/edit/:id)
import { useNavigate, useParams } from "react-router-dom";

// API functions — each maps to a .NET endpoint
import { createEmployee, getEmployee, updateEmployee } from "../services/api";

// Toast for showing success/error notifications
import { toast } from "react-toastify";

// ── THE EMPLOYEEFORM COMPONENT ─────────────────────────────────────────────

const EmployeeForm = () => {

  // ── URL PARAMETERS & NAVIGATION ────────────────────────────────────────

  // useParams() extracts named parameters from the URL.
  // For /employees/edit/abc123, it returns { id: "abc123" }
  // For /employees/new, it returns { id: undefined } (no :id in that route)
  //
  // We destructure { id } to get just the id value.
  // ANALOGY TO .NET: This is like [HttpGet("{id}")] — extracting {id} from the route.
  const { id } = useParams();

  // navigate() function for programmatic URL changes.
  const navigate = useNavigate();

  // DETERMINE MODE: If id exists → we're editing. If not → we're creating.
  // Boolean(undefined) = false, Boolean("abc123") = true
  const isEditMode = Boolean(id);

  // ── FORM STATE ─────────────────────────────────────────────────────────
  // All form field values are stored in a SINGLE state object.
  // This is cleaner than having separate useState for each field.
  //
  // Each property matches the "name" attribute of its corresponding <input>.
  // This is important for the handleChange function to work correctly.
  const [formData, setFormData] = useState({
    firstName: "",       // Text input
    lastName: "",        // Text input
    email: "",           // Email input
    phoneNumber: "",     // Text input (matches Employee.PhoneNumber in domain)
    department: "",      // Select dropdown
    position: "",        // Text input
    salary: "",          // Number input (stored as string until submission)
    dateOfJoining: "",   // Date input (format: "YYYY-MM-DD")
    isActive: true,      // Checkbox (true/false)
  });

  // loading: true while an API call is in progress (submit button shows "Saving...")
  const [loading, setLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({}); // For future validation error handling

  // ── FETCH EMPLOYEE DATA FOR EDIT MODE ──────────────────────────────────
  //
  // useEffect runs AFTER the component renders.
  // Here, we only fetch data if we're in edit mode (URL has an id).
  //
  // Dependency array [id]: if id changes, re-run this effect.
  // In practice, id doesn't change while on this page, so it runs once.
  // Note: fetchEmployee and isEditMode are intentionally excluded from the dep
  // array below. Including fetchEmployee would cause it to re-run every render
  // (new function reference each time). The disable comment must sit DIRECTLY
  // above the line it disables — no other comments in between.
  useEffect(() => {
    if (isEditMode) {
      // Only fetch if we're editing an existing employee
      fetchEmployee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch a single employee's data from the API and fill the form.
  const fetchEmployee = async () => {
    try {
      // GET /api/employee/{id} — fetch this specific employee
      const response = await getEmployee(id);

      // response.data is the employee object from the API:
      // { id, firstName, lastName, email, department, position, salary, dateOfJoining, isActive }
      const emp = response.data;

      // Set all form fields to the employee's current values.
      // This "pre-fills" the form so the user can see what they're editing.
      setFormData({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phoneNumber: emp.phoneNumber || "",  // Fallback for old records without this field
        department: emp.department,
        position: emp.position,
        salary: emp.salary,
        // DATE FORMATTING:
        // The API returns dates as ISO 8601 strings: "2024-01-15T00:00:00"
        // But HTML <input type="date"> requires: "2024-01-15" (just the date part)
        //
        // new Date("2024-01-15T00:00:00") creates a Date object
        // .toISOString() converts to "2024-01-15T00:00:00.000Z"
        // .split("T")[0] splits on "T" and takes the first part: "2024-01-15"
        dateOfJoining: emp.dateOfJoining
          ? new Date(emp.dateOfJoining).toISOString().split("T")[0]
          : "",
        isActive: emp.isActive,
      });

    } catch (error) {
      // If the employee doesn't exist (404) or other error
      toast.error("Failed to load employee data");
      navigate("/employees"); // Go back to the list
    }
  };

  // ── GENERIC CHANGE HANDLER ─────────────────────────────────────────────
  //
  // Instead of writing a separate handler for each input
  // (handleFirstNameChange, handleLastNameChange, etc.),
  // we use ONE handler for ALL inputs.
  //
  // HOW IT WORKS:
  // 1. Each <input> has a "name" attribute matching a formData property
  //    e.g., <input name="firstName" ... />
  // 2. When the user types, onChange fires with the event object
  // 3. We extract name and value from the event target (the input element)
  // 4. We update JUST that one property in formData using computed property names
  //
  // COMPUTED PROPERTY NAMES: { [name]: value }
  // If name = "firstName" and value = "John", this becomes:
  // { firstName: "John" }
  //
  // SPREAD OPERATOR: { ...prev, [name]: value }
  // This copies ALL existing formData properties, then overrides the one that changed.
  // Example: { firstName: "old", lastName: "Doe", ...rest } → { firstName: "John", lastName: "Doe", ...rest }
  const handleChange = (e) => {
    // Destructure the event target to get the input's properties
    const { name, value, type, checked } = e.target;
    // name: the input's name attribute (e.g., "firstName", "salary")
    // value: the current text/number in the input
    // type: the input type (e.g., "text", "checkbox", "number")
    // checked: for checkboxes only — true if checked, false if unchecked

    setFormData((prev) => ({
      ...prev,  // Copy all existing fields (spread operator)
      // For checkboxes, use "checked" (boolean). For everything else, use "value" (string).
      [name]: type === "checkbox" ? checked : value,
      // ^^^ [name] is a "computed property name" — uses the variable's VALUE as the key.
      // If name = "firstName", this becomes: { firstName: value }
    }));
  };

  const Validate = () =>{
    const errs = {};
      if(!formData.firstName) errs.firstName = "First Name is required";
      if(!formData.lastName) errs.lastName = "Last Name is required";
      if(!formData.email) errs.email = "Email is required";
      if (formData.salary <=0) errs.salary = "Salary must be greater than zero";
    return errs;
  }

  // ── FORM SUBMISSION HANDLER ────────────────────────────────────────────
  //
  // Called when the user clicks "Create Employee" or "Update Employee".
  // Determines which API call to make based on isEditMode.
  const handleSubmit = async (e) => {
    // Prevent default form behavior (page reload)
    e.preventDefault();
    const errs = Validate();
    if(Object.keys(errs).length > 0){
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    // Show loading state (button text changes to "Saving...")
    setLoading(true);

    try {
      // Build the employee object to send to the API.
      // We need to convert salary from string to number because
      // HTML inputs always give us strings, but the API expects a number.
      const employeeData = {
        ...formData,  // Copy all form fields
        salary: parseFloat(formData.salary) || 0,
        // ^^^ parseFloat("75000") → 75000 (number)
        // ^^^ parseFloat("") → NaN, and NaN || 0 → 0 (fallback to zero)
      };

      if (isEditMode) {
        // EDIT MODE: PUT /api/employee/{id} with the updated data
        await updateEmployee(id, employeeData);
        toast.success("Employee updated successfully");
      } else {
        // CREATE MODE: POST /api/employee with the new employee data
        await createEmployee(employeeData);
        toast.success("Employee created successfully");
      }

      // Navigate back to the employee list after successful save
      navigate("/employees");

    } catch (error) {
      // Show the error message from the API (e.g., "Email already exists")
      // or a generic fallback message if no specific message is available.
      toast.error(
        error.response?.data?.message || "Failed to save employee"
      );
    } finally {
      // Always reset loading state
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // ── JSX RETURN (the form UI) ───────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Dynamic title based on mode */}
        <h2 style={styles.title}>
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h2>

        {/* THE FORM — onSubmit triggers our handleSubmit function */}
        <form onSubmit={handleSubmit}>

          {/* ══════════════════════════════════════════════════════════════
              ROW 1: First Name + Last Name (side by side)
              The "row" style uses display: "flex" to place them horizontally.
              Each "formGroup" has flex: 1 so they share width equally.
              ══════════════════════════════════════════════════════════════ */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"               // Standard text input
                name="firstName"          // Links to formData.firstName (for handleChange)
                value={formData.firstName} // Controlled: value comes from state
                onChange={handleChange}    // Every keystroke → handleChange → state update
                style={styles.input}
              />
              {errors.firstName && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>
                {errors.firstName}
              </p>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                type="text"
                name="lastName"            // Links to formData.lastName
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.lastName && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>
                {errors.lastName}
              </p>}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              ROW 2: Email (full width)
              ══════════════════════════════════════════════════════════════ */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"               // Email type — browser validates format (must contain @)
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.email && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>
              {errors.email}
            </p>}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              ROW 3: Department (dropdown) + Position (text)
              ══════════════════════════════════════════════════════════════ */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department *</label>
              {/* SELECT DROPDOWN — works exactly like text inputs with handleChange.
                  The name="department" links to formData.department.
                  When user selects an option, onChange fires with the option's value. */}
              <select
                name="department"
                value={formData.department}  // Controlled: selected option comes from state
                onChange={handleChange}       // Selection change → state update
                style={styles.input}
                required
              >
                {/* The first option with value="" acts as a placeholder.
                    "required" validation prevents submitting with this selected. */}
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              ROW 4: Salary + Date of Joining
              ══════════════════════════════════════════════════════════════ */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Salary (USD) *</label>
              <input
                type="number"            // Number input — only allows numeric values
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                style={styles.input}
                min="0"                  // Minimum value (can't type negative)
                step="0.01"             // Allows cents (e.g., 75000.50)
              />
              {errors.salary && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>
                {errors.salary}
              </p>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Joining *</label>
              <input
                type="date"              // Date picker — shows calendar UI
                name="dateOfJoining"
                value={formData.dateOfJoining}  // Must be "YYYY-MM-DD" format
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"            // Links to formData.phoneNumber
                value={formData.phoneNumber}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              ROW 5: Active Status (checkbox)
              ══════════════════════════════════════════════════════════════ */}
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"            // Checkbox — true/false toggle
              name="isActive"            // Links to formData.isActive
              checked={formData.isActive} // IMPORTANT: checkboxes use "checked", not "value"
              onChange={handleChange}     // handleChange uses e.target.checked for checkboxes
              id="isActive"              // id links this input to the label below (for accessibility)
            />
            {/* htmlFor (not "for") links the label to the checkbox by id.
                Clicking the label text also toggles the checkbox. */}
            <label htmlFor="isActive" style={styles.checkboxLabel}>
              Active Employee
            </label>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              ACTION BUTTONS: Submit + Cancel
              ══════════════════════════════════════════════════════════════ */}
          <div style={styles.buttonRow}>
            {/* SUBMIT BUTTON — triggers the form's onSubmit event */}
            {/* <button type="submit" style={styles.submitBtn} disabled={loading}> */}
            <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
              {/* Triple ternary: loading → "Saving..." | edit → "Update" | create → "Create"
                  This is equivalent to:
                  if (loading) return "Saving...";
                  else if (isEditMode) return "Update Employee";
                  else return "Create Employee"; */}
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Employee"
                : "Create Employee"}
            </button>

            {/* CANCEL BUTTON — goes back to employee list without saving.
                type="button" prevents this from triggering form submission.
                (Default type for <button> inside <form> is "submit") */}
            <button
              type="button"
              onClick={() => navigate("/employees")}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── INLINE STYLES ──────────────────────────────────────────────────────────

const styles = {
  // Outer container — centered on page with padding
  container: {
    maxWidth: "700px",
    margin: "40px auto",     // 40px top/bottom, auto centers horizontally
    padding: "20px",
  },

  // Card — white box with shadow (contains the form)
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  // Form title
  title: {
    color: "#1a1a2e",
    marginBottom: "30px",
  },

  // Row — horizontal layout for side-by-side fields
  row: {
    display: "flex",         // Flexbox: lay out children horizontally
    gap: "20px",             // 20px space between the two fields
  },

  // Form group — wrapper for label + input
  formGroup: {
    marginBottom: "20px",
    flex: 1,                 // Each group takes equal width within a row
  },

  // Label styles
  label: {
    display: "block",        // Full width (label on its own line above input)
    marginBottom: "5px",
    fontWeight: "600",
    color: "#333",
    fontSize: "14px",
  },

  // Input/select styles — shared between text, email, number, date, and select
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  // Checkbox group — horizontal layout for checkbox + label
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "25px",
  },
  checkboxLabel: {
    color: "#333",
    fontWeight: "600",
  },

  // Button row — holds Submit and Cancel buttons side by side
  buttonRow: {
    display: "flex",
    gap: "15px",
  },

  // Submit button — dark background
  submitBtn: {
    padding: "12px 30px",
    backgroundColor: "#1a1a2e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  // Cancel button — transparent with border
  cancelBtn: {
    padding: "12px 30px",
    backgroundColor: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default EmployeeForm;
