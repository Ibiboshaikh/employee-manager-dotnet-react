// ============================================================================
// useEmployees — owns all employee data: fetch on mount, delete (two-step
// modal flow + undo), and the timestamp of the last successful fetch.
//
// EmployeeList consumes the return value and stays purely presentational.
// Same idea as moving logic out of a .NET controller into a service.
// ============================================================================

import { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { createEmployee, getEmployees, deleteEmployee } from "../services/api";
import { Employee } from "../Types/Models";
import { useRecentActivity } from "../Context/RecentActivityContext";

type ConfirmState = {
  open: boolean;
  id: string | null;
  name: string;
}

type ConfirmAction = {
  type: "open" | "close";
  id?: string;
  name?: string;
}

function confirmReducer(state: ConfirmState, action: ConfirmAction): ConfirmState {
  switch (action.type) {
    case "open":
      return { open: true, id: action.id || null, name: action.name || "" };
    case "close":
      return { open: false, id: null, name: "" };
    default:
      return state;
  }
}

export interface UseEmployeesReturn {
    employees: Employee[];
    loading: boolean;
    fetchedAt: string | null;
    confirm: ConfirmState;
    handleDelete: (id: string, name: string) => void;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

function useEmployees(): UseEmployeesReturn {
  // Core state: the list, loading flag, and last-fetch timestamp.
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
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
  const handleDelete = (id: string, name: string) => {
    dispatch({ type: 'open', id, name });
  };

  // Step 2: user confirmed. Hit the API, show a toast with an Undo button,
  // then drop the row from local state. Skipping a re-fetch keeps the UI instant.
  const onConfirm = async () => {
    try {
      if (confirm.id === null) return;
      await deleteEmployee(confirm.id);

      // Capture the full employee BEFORE removing — Undo needs to restore it.
      const deletedEmployee = employees.find((e) => e.id === confirm.id) as Employee;
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

  // Restore a deleted employee by re-creating it on the server and re-adding to local state.
  const handleUndo = async (employee: Employee) => {
    try {
      await createEmployee(employee);
      setEmployees((prev) => [...prev, employee]);
      toast.success("Delete undone.");
      addActivity(`Undo delete: ${employee.firstName} ${employee.lastName}`);
    } catch (error: unknown) {
      toast.error((error as any).response?.data?.message || "Failed to save employee");
    }
  };

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