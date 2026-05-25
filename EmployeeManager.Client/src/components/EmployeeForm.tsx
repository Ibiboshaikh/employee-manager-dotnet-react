// ============================================================================
// EmployeeForm.tsx — A dual-purpose form for CREATING and EDITING employees.
//
// This is ONE component that handles TWO tasks:
//   - CREATE MODE: URL is /employees/new → form starts empty
//   - EDIT MODE:   URL is /employees/edit/:id → form is pre-filled with existing data
//
// HOW IT DETERMINES THE MODE:
// The URL parameter ":id" tells us. In App.tsx, we defined:
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

import { useEffect } from "react";
import { isAxiosError } from 'axios';
// useNavigate: programmatic navigation (go to another page)
// useParams: read URL parameters (the :id from /employees/edit/:id)
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// API functions — each maps to a .NET endpoint
import { createEmployee, getEmployee, updateEmployee } from "../services/api";

// Toast for showing success/error notifications
import { toast } from "react-toastify";
import { Employee } from "../Types/Models";
import { toEmployeeId } from "../Types/Ids";
import { employeeKeys } from "../Queries/employeeKeys";
import { routes } from "../routes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, EmployeeFormData } from "../schemas/employeeSchema";

const useEmployee = (id: ReturnType<typeof toEmployeeId> | undefined) => {
  return useQuery({
    // Uses your centralized key factory builder detail structure
    queryKey: employeeKeys.detail(id!),
    queryFn: async () => {
      const response = await getEmployee(id!);
      return response.data;
    },
    // Safely prevents running if there is no ID (Create Mode)
    enabled: Boolean(id),
  });
};

// ── THE EMPLOYEEFORM COMPONENT ─────────────────────────────────────────────

const EmployeeForm = () => {
  // ── URL PARAMETERS & NAVIGATION ────────────────────────────────────────

  // useParams() extracts named parameters from the URL.
  // For /employees/edit/abc123, it returns { id: "abc123" }
  // For /employees/new, it returns { id: undefined } (no :id in that route)
  //
  // We destructure { id } to get just the id value.
  // ANALOGY TO .NET: This is like [HttpGet("{id}")] — extracting {id} from the route.
  const { id } = useParams<{ id: string }>();
  const employeeId = id ? toEmployeeId(id) : undefined;
  
  const { data: employeeData } = useEmployee(employeeId);

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

  // RHF + Zod: the schema owns all validation rules (see employeeSchema.ts).
  // That's why register() calls below have no inline { required: ... } — one
  // source of truth, change the schema and both rules + type update.
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, touchedFields, isValid }
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: "onTouched", // Validate fields when they are touched (blurred)
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      department: "",
      position: "",
      salary: 0,
      dateOfJoining: "",
      isActive: true,
    }
  });

  // loading: true while an API call is in progress (submit button shows "Saving...")
  const queryClient = useQueryClient();
  
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
    if (employeeData) {
      reset({
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phoneNumber: employeeData.phoneNumber || "",
        department: employeeData.department,
        position: employeeData.position,
        salary: employeeData.salary,
        dateOfJoining: employeeData.dateOfJoining
          ? new Date(employeeData.dateOfJoining).toISOString().split("T")[0]
          : "",
        isActive: employeeData.isActive,
      });
    }
  }, [employeeData, reset]); // Triggers automatically the exact millisecond data arrives

  // Fetch a single employee's data from the API and fill the form.

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

  const createMutation = useMutation({
    mutationFn: async (employee: Omit<Employee, 'id'>) =>{
      await createEmployee(employee);
    },
    onSuccess: () =>{
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success("Employee created successfully");
      navigate(routes.employees());
    },
    onError: (error) =>{
      const message = isAxiosError<{ message?: string }>(error)? error.response?.data?.message || "Failed to create employee"
      : "Failed to create employee";
      setError("root", { message });
      toast.error(message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Employee) =>{
      await updateEmployee(updatedData.id, updatedData);
    },
    onMutate: (updatedData) =>{
      queryClient.cancelQueries({ queryKey: employeeKeys.all });
      const previousEmployees = queryClient.getQueryData<Employee[]>(employeeKeys.all);
      queryClient.setQueryData<Employee[]>(employeeKeys.all, (old = []) =>
        old.map(emp => emp.id === updatedData.id ? updatedData : emp)
      );
      return { previousEmployees };
    },
    onError: (error, _updatedData, context) =>{
      const errorMessage = isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message || "Failed to update employee"
      : "Failed to update employee";
      setError("root", { message: errorMessage });
      toast.error(errorMessage);

      if (context?.previousEmployees) {
        queryClient.setQueryData(employeeKeys.all, context.previousEmployees);
      }
    },
    onSettled: () =>{
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onSuccess: () =>{
      toast.success("Employee updated successfully");
      navigate(routes.employees());
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onValidSubmit = (data: EmployeeFormData) => {
    if (isEditMode) {
      const payload: Employee = {
        ...data,
        id: toEmployeeId(id!),
        salary: data.salary
      };
      updateMutation.mutate(payload);
    }
    else {
      const payload: Omit<Employee, 'id'> = {
        ...data,
        salary: data.salary
      };
      createMutation.mutate(payload);
    }
  }

  // ── FORM SUBMISSION HANDLER ────────────────────────────────────────────
  //
  // Called when the user clicks "Create Employee" or "Update Employee".
  // Determines which API call to make based on isEditMode.
  
  // ── JSX RETURN (the form UI) ───────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h2> 

        {/* Bind your form submission run wrapper */}
        <form onSubmit={handleSubmit(onValidSubmit)}>
          {errors.root && <p style={{color: 'Red', fontSize: '14px', marginBottom: '20px'}}>{errors.root.message}</p>}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"
                style={styles.input}
                {...register("firstName")}
              />
              {touchedFields.firstName && errors.firstName && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.firstName.message}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                type="text"
                style={styles.input}
                {...register("lastName")}
              />
              {touchedFields.lastName && errors.lastName && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              style={styles.input}
              {...register("email")}
            />
            {touchedFields.email && errors.email && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.email.message}</p>}
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department *</label>
              <select
                style={styles.input}
                {...register("department")}
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
              {touchedFields.department && errors.department && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.department.message}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Position *</label>
              <input
                type="text"
                style={styles.input}
                {...register("position")}
              />
              {touchedFields.position && errors.position && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.position.message}</p>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Salary (USD) *</label>
              <input
                type="number"
                style={styles.input}
                step="0.01"
                // valueAsNumber: RHF coerces string→number BEFORE Zod validates.
                // That's what lets the schema use z.number(), not z.coerce.number().
                {...register("salary", { valueAsNumber: true })}
              />
              {touchedFields.salary && errors.salary && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.salary.message}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Joining *</label>
              <input
                type="date"
                style={styles.input}
                {...register("dateOfJoining")}
              />
              {touchedFields.dateOfJoining && errors.dateOfJoining && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.dateOfJoining.message}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                style={styles.input}
                {...register("phoneNumber")}
              />
              {touchedFields.phoneNumber && errors.phoneNumber && <p style={{color: 'Red', fontSize: '12PX', margin: '4px 0 0'}}>{errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
            />
            <label htmlFor="isActive" style={styles.checkboxLabel}>
              Active Employee
            </label>
          </div>

          <div style={styles.buttonRow}>
            <button type="submit" style={styles.submitBtn} disabled={!isValid || isPending}>
              {isPending ? "Saving..." : isEditMode ? "Update Employee" : "Create Employee"}
            </button>

            <button
              type="button"
              onClick={() => navigate(routes.employees())}
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
    boxSizing: "border-box" as const,
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