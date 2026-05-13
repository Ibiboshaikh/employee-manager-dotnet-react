// ============================================================================
// useEmployees — owns all employee data: fetch on mount, delete (two-step
// modal flow + undo), and the timestamp of the last successful fetch.
//
// EmployeeList consumes the return value and stays purely presentational.
// Same idea as moving logic out of a .NET controller into a service.
// ============================================================================

import { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { getEmployees, deleteEmployee } from "../services/api";
import { useRecentActivity } from "../Context/RecentActivityContext";

function confirmReducer(state, action) {
  switch (action.type) {
    case "open":
      return { open: true, id: action.id, name: action.name };
    case "close":
      return { open: false, id: null, name: "" };
    default:
      return state;
  }
}

function useEmployees() {
  // Core state: the list, loading flag, and last-fetch timestamp.
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);
  const { addActivity } = useRecentActivity();

  // Delete-confirmation state. id/name are remembered while the modal is open
  // so onConfirm knows which employee to delete and the toast can name them.
  const [confirm, dispatch] = useReducer(confirmReducer, { open: false, id: null, name: "" });

  // GET /api/employee — JWT is attached by the Axios interceptor in api.js.
  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
      setFetchedAt(new Date().toLocaleTimeString());
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount. Empty deps = .NET OnInitializedAsync equivalent.
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Step 1 of delete flow: just open the confirm modal. No API call yet —
  // the user must click "Yes, Delete" first.
  const handleDelete = (id, name) => {
    dispatch({ type: 'open', id, name });
  };

  // Step 2: user confirmed. Hit the API, show a toast with an Undo button,
  // then drop the row from local state. Skipping a re-fetch keeps the UI instant.
  const onConfirm = async () => {
    try {
      await deleteEmployee(confirm.id);

      // Capture the full employee BEFORE removing — Undo needs to restore it.
      const deletedEmployee = employees.find((e) => e.id === confirm.id);
      debugger
      addActivity(`Deleted: ${deletedEmployee.firstName} ${deletedEmployee.lastName}`);
      // Toast holds an inline Undo button. Capture the toastId so the button
      // can dismiss the toast on click (closure reads it at click time, by
      // which point toast.success has returned and assigned the value).
      const toastId = toast.success(
        <span>
          {deletedEmployee.firstName} {deletedEmployee.lastName} deleted.{" "}
          <button
            onClick={() => {
              handleUndo(deletedEmployee);
              toast.dismiss(toastId);
            }}
          >
            Undo
          </button>
        </span>,
        { autoClose: 5000 }
      );

      setEmployees((prev) => prev.filter((e) => e.id !== confirm.id));
    } catch (error) {
      toast.error("Failed to delete employee");
    } finally {
      // Close the modal whether the delete succeeded or failed.
      dispatch({ type: "close" });
    }
  };

  // Restore a deleted employee to local state. No API call — purely client-side.
  function handleUndo(employee) {
    setEmployees((prev) => [...prev, employee]);
    toast.success("Delete undone.");
    addActivity(`Undo delete: ${employee.firstName} ${employee.lastName}`);
  }

  // Close the modal without deleting.
  function onCancel() {
    dispatch({ type: "close" });
  }

  // Expose only what EmployeeList reads. setEmployees and fetchEmployees
  // stay private — no external caller needs them.
  return {
    employees,
    loading,
    fetchedAt,
    confirm,
    handleDelete,
    onConfirm,
    onCancel,
  };
}

export default useEmployees;
