// ============================================================================
// useEmployees — owns all employee data: fetch on mount, delete, and the
// timestamp of the last successful fetch.
//
// EmployeeList consumes the return value and stays purely presentational.
// Same idea as moving logic out of a .NET controller into a service.
// ============================================================================

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getEmployees, deleteEmployee } from "../services/api";
function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [confirm, setConfirm] = useState({open: false, id: null, name:""});

  
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

  // Run once on mount. Empty deps = OnInitializedAsync equivalent.
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Confirm, delete on the server, then drop the row from local state.
  // Skipping a re-fetch keeps the UI instant.
  const handleDelete = async (id, name) => {
   setConfirm({open: true, id, name});
  };

  const  onConfirm = async () => {
    try {
        await deleteEmployee(confirm.id);
        setEmployees((prev) => prev.filter((e) => e.id !== confirm.id));
        toast.success("Employee deleted");
      } catch (error) {
        toast.error("Failed to delete employee");
      } finally {
        setConfirm({open: false, id: null, name:""});
      }
  }

  function oncancel() {
    setConfirm({open: false, id: null, name:""});
  }

  // Expose only what EmployeeList reads. setEmployees and fetchEmployees
  // stay private — no external caller needs them.
  return { employees, loading, handleDelete, fetchedAt, confirm, onConfirm, oncancel };
}

export default useEmployees;
