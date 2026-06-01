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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeKeys } from "../Queries/employeeKeys";

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
  onConfirm: () => void;
  onCancel: () => void;
}

function useEmployees(): UseEmployeesReturn {
  const queryClient = useQueryClient();
  const { addActivity } = useRecentActivity();

  // useQuery owns the employee list. On mount it fires queryFn; the result
  // is cached under ['employees']. data / loading / error states all come
  // from React Query — no manual useState or useEffect for fetching.
  const { data: employees = [], isLoading: loading, isError, dataUpdatedAt } = useQuery({
    queryKey: employeeKeys.all,
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

  const deleteMutation = useMutation({
    mutationFn: async (id: EmployeeId) => {
      await deleteEmployee(id);
    },

    onMutate: async (id) =>{
      await queryClient.cancelQueries({ queryKey: employeeKeys.all });
      const previousEmployees = queryClient.getQueryData<Employee[]>(employeeKeys.all);
      queryClient.setQueryData<Employee[]>(employeeKeys.all, (old = []) =>
        old.filter(e => e.id !== id)
      );
      return { previousEmployees };
    },
    
    onError: (error, _id, context) =>{
      const errorMessage = isAxiosError<{ message?: string}>(error)? error.response?.data?.message 
        || "Failed to delete" : "Failed to delete";
      toast.error(errorMessage);
    
    // Rollback to the exact state it was before the delete button was clicked
    if (context?.previousEmployees) {
      queryClient.setQueryData(employeeKeys.all, context.previousEmployees);
    }
    },
    onSettled: () =>{
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    }
  });

  const undoMutation = useMutation({
    mutationFn: async (employees: Employee) => {
      await createEmployee(employees);
    },

    onMutate: async (employee) =>{
      await queryClient.cancelQueries({ queryKey: employeeKeys.all });
      const previousEmployees = queryClient.getQueryData<Employee[]>(employeeKeys.all);
      queryClient.setQueryData<Employee[]>(employeeKeys.all, (old = []) =>[
        ...old,
        employee,
      ]);
      return { previousEmployees };
    },

    onError: (error, _employee, context) =>{
      const errorMessage = isAxiosError<{ message?: string}>(error)? error.response?.data?.message 
        || "Failed to undo delete" : "Failed to undo delete";
      toast.error(errorMessage);

      if (context?.previousEmployees) {
        queryClient.setQueryData<Employee[]>(employeeKeys.all, context.previousEmployees);
      }
    },

    onSettled: () =>{
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    }
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
  const onConfirm = () => {
    if (!confirm.id) return;

    const deletedEmployee = employees.find(e=> e.id === confirm.id);
    
    if (deletedEmployee) {
      addActivity({
        action: "Deleted employee",
        details: `${deletedEmployee.firstName} ${deletedEmployee.lastName} was deleted`,
        timestamp: new Date().toISOString(),
        id: confirm.id,
      });

      const toastId = toast.success(
        <span>
          {deletedEmployee.firstName} {deletedEmployee.lastName} deleted. {" "}
          <button className="btn-success" onClick={() => {
            handleUndo(deletedEmployee);
            toast.dismiss(toastId);
          }}>Undo</button>
        </span>,
        { autoClose: 5000 }
      );
    
    }
    deleteMutation.mutate(confirm.id);
    dispatch({ type: "close" });
  };

  // Restore a deleted employee by re-creating it on the server and
  // appending it back into the React Query cache. Symmetric inverse
  // of onConfirm's delete: filter out → append back.
  const handleUndo = (employee: Employee) => {
    undoMutation.mutate(employee);
    toast.success("Delete undone");
    addActivity({
      action: "Undo Delete",
      details: `Restored ${employee.firstName} ${employee.lastName}`,
      timestamp: new Date().toISOString(),
      id: employee.id,
    });
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
