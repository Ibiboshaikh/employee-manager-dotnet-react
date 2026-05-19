// ============================================================================
// useEmployees — owns all employee data: caches the list via React Query,
// runs the two-step delete flow (confirm modal + cache patch), and supports
// undo by re-creating the deleted row on the server and writing it back
// into the cache.
//
// EmployeeList consumes the return value and stays purely presentational.
// React Query is the .NET IMemoryCache analog — same idea as moving fetch
// + cache out of a controller into a service.
// ============================================================================
import { useReducer, useEffect } from "react";
import { toast } from "react-toastify";
import { createEmployee, getEmployees, deleteEmployee } from "../services/api";
import { Employee } from "../Types/Models";
import { useRecentActivity } from "../Context/RecentActivityContext";
import { isAxiosError } from "axios";
import { EmployeeId } from "../Types/Ids";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ConfirmState = {
  open: boolean;
  id: EmployeeId | null;
  name: string;
};

type ConfirmAction =
  | { type: "open"; id: EmployeeId; name: string }
  | { type: "close" };

function confirmReducer(_state: ConfirmState, action: ConfirmAction): ConfirmState {
  switch (action.type) {
    case "open":
      return { open: true, id: action.id, name: action.name };
    case "close":
      return { open: false, id: null, name: "" };
    default: {
      const _exhaustive: never = action;
      throw new Error(`unreachable: ${_exhaustive}`);
    }
  }
}

export interface UseEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  fetchedAt: string | null;
  confirm: ConfirmState;
  handleDelete: (id: EmployeeId, name: string) => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

function useEmployees(): UseEmployeesReturn {
  const queryClient = useQueryClient();
  const { addActivity } = useRecentActivity();

  // useQuery owns the employee list. On mount it fires queryFn; the result
  // is cached under ['employees']. data / loading / error states all come
  // from React Query — no manual useState or useEffect for fetching.
  const { data: employees = [], isLoading: loading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await getEmployees();
      return response.data;
    },
  });

  // React Query doesn't toast on its own — wire the existing error UX manually.
  useEffect(() => {
    if (isError) toast.error("Failed to load employees");
  }, [isError]);

  // dataUpdatedAt is a millisecond timestamp React Query maintains for the
  // last successful fetch. Derived, not state.
  const fetchedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : null;

  // Delete-confirmation state. id/name are remembered while the modal is open
  // so onConfirm knows which employee to delete and the toast can name them.
  const [confirm, dispatch] = useReducer(confirmReducer, {
    open: false,
    id: null,
    name: "",
  });

  // Step 1 of delete flow: open the confirm modal. No API call yet —
  // the user must click "Yes, Delete" first.
  const handleDelete = (id: EmployeeId, name: string) => {
    dispatch({ type: "open", id, name });
  };

  // Step 2: user confirmed. Hit the API, show a toast with an Undo button,
  // then patch the row out of the React Query cache. Direct setQueryData
  // (not invalidateQueries) keeps the UI instant — no refetch needed
  // because we know the new state locally.
  const onConfirm = async () => {
    try {
      if (confirm.id === null) return;
      await deleteEmployee(confirm.id);

      // Capture the full employee BEFORE removing — Undo needs to restore it.
      const deletedEmployee = employees.find((e) => e.id === confirm.id) as Employee;
      addActivity({
        action: "Deleted Employee",
        details: `${deletedEmployee.firstName} ${deletedEmployee.lastName} was deleted`,
        timestamp: new Date().toISOString(),
        id: confirm.id,
      });

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

      // Filter the deleted row out of the cache — synchronous cache write.
      queryClient.setQueryData<Employee[]>(["employees"], (old = []) =>
        old.filter((e) => e.id !== confirm.id)
      );
    } catch (error) {
      toast.error("Failed to delete employee");
    } finally {
      // Close the modal whether the delete succeeded or failed.
      dispatch({ type: "close" });
    }
  };

  // Restore a deleted employee by re-creating it on the server and
  // appending it back into the React Query cache. Symmetric inverse
  // of onConfirm's delete: filter out → append back.
  const handleUndo = async (employee: Employee) => {
    try {
      await createEmployee(employee);
      queryClient.setQueryData<Employee[]>(["employees"], (old = []) => [
        ...old,
        employee,
      ]);
      toast.success("Delete undone.");
      addActivity({
        action: "Undo Delete",
        details: `Undo delete: ${employee.firstName} ${employee.lastName}`,
        timestamp: new Date().toISOString(),
        id: employee.id,
      });
    } catch (error) {
      const errorMessage = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || "Failed to undo delete"
        : "Failed to undo delete";
      toast.error(errorMessage);
    }
  };

  // Close the modal without deleting.
  function onCancel() {
    dispatch({ type: "close" });
  }

  // Expose only what EmployeeList reads. The QueryClient and reducer
  // dispatch stay private — callers shouldn't need to know how data
  // is fetched or how the modal state machine works.
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
