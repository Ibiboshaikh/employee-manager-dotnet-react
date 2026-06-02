// ============================================================================
// EmployeeList — main dashboard. Composes hooks for data, filtering, and
// sorting, then renders the table.
//
// All employee fetching/deleting lives in useEmployees.
// Filtering lives in useEmployeeFilter. Sorting lives in useSort.
// This file is mostly JSX + a small amount of derived/local UI state.
// ============================================================================

import { useState, useEffect, Fragment, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import EmployeeRow from './EmployeeRow';
import FilterBar from './FilterBar';
import StatsBar from './StatsBar';
import useSort from '../hooks/useSort';
import useEmployeeFilter from '../hooks/useEmployeeFilter';
import useEmployees from '../hooks/useEmployees';
import ConfirmModal from "./ConfirmModal";
// import { useAuth } from "../Context/AuthContext";
import RecentActivityModal from "./RecentActivityModal";
import { Employee } from "../Types/Models";
import { EmployeeId } from "../Types/Ids";
import { useSearchParams } from "react-router-dom";
import { routes } from "../routes";
import { useAuth } from "../Context/AuthContext";
// import { useProfile } from "../Queries/useProfile";
//import clsx from "clsx";
const EmployeeList = () => {
  // const profile = useProfile();
  // ── HOOKS ──────────────────────────────────────────────────────────────
  // Data + delete handling
  const { employees, loading, handleDelete, fetchedAt, confirm, onConfirm, onCancel } = useEmployees();

  // Filter values, setters, and the filtered array.
const [searchParams, setSearchParams] = useSearchParams();
  const {
    search, setSearch,
    department, setDepartment,
    hideBelow50K, sethideBelow50K,
    minSalary, setMinSalary,
    maxSalary, setMaxSalary,
    filtered,
  } = useEmployeeFilter(employees, searchParams, setSearchParams);

  // const { user, logout } = useAuth();

  // Current { field, order } and a toggler.
  const [sort, handleSort] = useSort<Employee>('firstName');

  // ── LOCAL UI STATE ─────────────────────────────────────────────────────
  const [view, setView] = useState(0);             // FilterBar layout toggle
  const [selected, setSelected] = useState<EmployeeId | null>(null);  // Currently clicked row id

  const [recentActivityOpen, setRecentActivityOpen] = useState(false); // Recent Activity Modal

  // Pagination state. totalPages and paginated below are derived, not state.
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { user } = useAuth();

  // ── DERIVED VALUES (do NOT store in state) ─────────────────────────────
  // Sort runs on the filtered slice every render — cheap and always fresh.
  const sorted = [...filtered].sort((a, b) => {
    let result;
    switch (sort.field) {
      case 'salary':
        result = a.salary - b.salary;
        break;
      case 'dateOfJoining':
        result = new Date(a.dateOfJoining).getTime() - new Date(b.dateOfJoining).getTime();
        break;
      case 'isActive':
        result = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
        break;
      default:
        const fieldA = a[sort.field] as string;
        const fieldB = b[sort.field] as string;
        result = fieldA.localeCompare(fieldB);
    }
    return sort.order === 'asc' ? result : -result;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Resolve the selected id back to its full employee object.
  const selectedEmployee = employees.find(e => e.id === selected);

  // ── NAVIGATION ─────────────────────────────────────────────────────────
  const navigate = useNavigate();

  // Reset to page 1 whenever the filter result count changes, so a filter
  // change doesn't strand the user on an empty page (e.g. was on page 5,
  // applied a filter that left only 12 rows = 2 pages).
  useEffect(() => {
    setPage(1);
  }, [filtered.length]);

  // ── HANDLERS ───────────────────────────────────────────────────────────
  // const handleLogout = () => {
  //   logout();
  //   navigate("/login");
  // };

  // Stable callbacks for memoized EmployeeRow. Without useCallback, a new
  // function identity each render defeats React.memo on the row.

  

  const onEdit = useCallback((id: EmployeeId) => navigate(routes.editEmployee(id)), [navigate]);
  const onDelete = useCallback((id: EmployeeId, name: string) => handleDelete(id, name), [handleDelete]);

  // ── RENDER ─────────────────────────────────────────────────────────────
  if (loading) return <div className="text-center p-12 text-gray-500 dark:text-gray-400">Loading employees...</div>;

  return (
    <div className="max-w-6xl max-auto p-6">

      {/* NAVBAR — title left, user info + logout right */}
      {/* <div className="flex justify-between items-center p-4 bg-gray-800 text-white rounded mb-4">
        <h2 className="text-lg font-semibold">Employee Manager</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm">Hello, {user?.fullName}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div> */}

      {/* HEADER — fetch timestamp, count, stats, add button */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        {fetchedAt && <p>Last Fetched at: {fetchedAt}</p>}
        <h3>Employees ({filtered.length})</h3>
        <StatsBar filtered={filtered} />
        {user?.role === "Admin" && (
          <button className="btn-primary" onClick={() => navigate(routes.newEmployee())}>
            + Add Employee
          </button>
        )}
      </div>

      {/* TABLE — or empty state if no employees exist at all */}
      {employees.length === 0 ? (
        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
          No employees found. Click "Add Employee" to create one.
        </div>
      ) : (
        <Fragment>
          <FilterBar
            search={search} onSearchChange={setSearch}
            department={department} onDepartmentChange={setDepartment}
            hideBelow50K={hideBelow50K} onHideBelow50KChange={sethideBelow50K}
            view={view} onViewChange={setView}
            minSalary={minSalary} onMinSalaryChange={setMinSalary}
            maxSalary={maxSalary} onMaxSalaryChange={setMaxSalary}
            departments={[...new Set(employees.map(e => e.department))]}
            onClear={() => {
              setSearchParams(new URLSearchParams(), { replace: true });
              setView(0); // Kept since 'view' is a separate local state variable
            }}
          />

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('firstName')}>
                  Name {sort.field === 'firstName' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('email')}>
                  Email {sort.field === 'email' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('department')}>
                  Department {sort.field === 'department' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('position')}>
                  Position {sort.field === 'position' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('phoneNumber')}>
                  Phone {sort.field === 'phoneNumber' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('salary')}>
                  Salary {sort.field === 'salary' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('dateOfJoining')}>
                  Joined {sort.field === 'dateOfJoining' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" 
                  onClick={() => handleSort('isActive')}>
                  Status {sort.field === 'isActive' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
              {paginated.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSelect={setSelected}
                  selected={selected}
                />
              ))}
            </tbody>
          </table>

          {/* PAGINATION — Prev / Page X of Y / Next */}
          <div className="flex items-center gap-4 mt-4">
            <button disabled={page === 1} className="btn-secondary" onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span> Page {page} of {totalPages} </span>
            <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>

          {/* Footer label for the currently selected row (clicked, not edited) */}
          <label>{selectedEmployee?.firstName}: {selectedEmployee?.salary}</label>

          {/* DELETE CONFIRM MODAL — state lives in useEmployees; rendered here */}
          <ConfirmModal
            open={confirm.open}
            message={confirm.name}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
          {/* <pre>{
            JSON.stringify(profile.data, null, 2) 
          }</pre> */}
          <button className="btn-success" onClick={() => setRecentActivityOpen(true)}>View Recent Activities</button>
          {/* RECENT ACTIVITY MODAL — state lives in RecentActivityContext; rendered here */}
          <RecentActivityModal
            open={recentActivityOpen}
            onClose={() => setRecentActivityOpen(false)}
          />
          {/* <h1 className="text-3xl font-bold text-red-600">Tailwind works!</h1> */}

          {/* <div className="p-4 bg-white dark:bg-black text-black dark:text-white">
  If I am black in dark mode, the config works!
</div> */}
        </Fragment>
      )}
    </div>
  );
};
export default EmployeeList;
