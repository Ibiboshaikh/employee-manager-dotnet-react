// ============================================================================
// EmployeeList — main dashboard. Composes hooks for data, filtering, and
// sorting, then renders the table.
//
// All employee fetching/deleting lives in useEmployees.
// Filtering lives in useEmployeeFilter. Sorting lives in useSort.
// This file is mostly JSX + a small amount of derived/local UI state.
// ============================================================================

import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";

import EmployeeRow from './EmployeeRow';
import FilterBar from './FilterBar';
import StatsBar from './StatsBar';
import useSort from '../hooks/useSort';
import useEmployeeFilter from '../hooks/useEmployeeFilter';
import useEmployees from '../hooks/useEmployees';

const EmployeeList = () => {
  // ── HOOKS ──────────────────────────────────────────────────────────────
  // Data + delete handling
  const { employees, loading, handleDelete, fetchedAt } = useEmployees();

  // Filter values, setters, and the filtered array.
  const {
    search, setSearch,
    department, setDepartment,
    hideBelow50K, sethideBelow50K,
    minSalary, setMinSalary,
    maxSalary, setMaxSalary,
    filtered,
  } = useEmployeeFilter(employees);

  // Current { field, order } and a toggler.
  const [sort, handleSort] = useSort('firstName');

  // ── LOCAL UI STATE ─────────────────────────────────────────────────────
  const [view, setView] = useState(0);             // FilterBar layout toggle
  const [selected, setSelected] = useState(null);  // Currently clicked row id

  const [page, setPage] = useState(1);                 // For pagination (not implemented yet)
  const pageSize = 10;                                  // Employees per page

  // ── DERIVED VALUES (do NOT store in state) ─────────────────────────────
  // Sort runs on the filtered slice every render — cheap and always fresh.
  const sorted = [...filtered].sort((a, b) => {
    let result;
    switch (sort.field) {
      case 'salary':
        result = a.salary - b.salary;
        break;
      case 'dateOfJoining':
        result = new Date(a.dateOfJoining) - new Date(b.dateOfJoining);
        break;
      case 'isActive':
        result = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
        break;
      default:
        result = a[sort.field].localeCompare(b[sort.field]);
    }
    return sort.order === 'asc' ? result : -result;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Resolve the selected id back to its full employee object.
  const selectedEmployee = employees.find(e => e.id === selected);

  // ── NAVIGATION + USER INFO ─────────────────────────────────────────────
  const navigate = useNavigate();

  // Logged-in user written to localStorage at login.
  // The || "{}" fallback prevents JSON.parse from crashing when nothing is stored.
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Debug: log how many employees survive the current filter.
  useEffect(() => {
    console.log('Filter changed:', filtered.length, 'employees shown');
  }, [filtered]);

  useEffect(() => { setPage(1); }, [filtered.length]);

  // ── HANDLERS ───────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── RENDER ─────────────────────────────────────────────────────────────
  if (loading) return <div style={styles.loading}>Loading employees...</div>;

  return (
    <div style={styles.container}>

      {/* NAVBAR — title left, user info + logout right */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>Employee Manager</h2>
        <div style={styles.navRight}>
          <span style={styles.userName}>Hello, {user.fullName}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* HEADER — fetch timestamp, count, stats, add button */}
      <div style={styles.header}>
        {fetchedAt && <p>Last Fetched at: {fetchedAt}</p>}
        <h3>Employees ({filtered.length})</h3>
        <StatsBar filtered={filtered} />
        <button
          onClick={() => navigate("/employees/new")}
          style={styles.addBtn}
        >
          + Add Employee
        </button>
      </div>

      {/* TABLE — or empty state if no employees exist at all */}
      {employees.length === 0 ? (
        <div style={styles.empty}>
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
              setSearch('');
              setDepartment('');
              sethideBelow50K(false);
              setView(0);
              setMinSalary('');
              setMaxSalary('');
            }}
          />

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => handleSort('firstName')}>
                  Name {sort.field === 'firstName' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('email')}>
                  Email {sort.field === 'email' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('department')}>
                  Department {sort.field === 'department' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('position')}>
                  Position {sort.field === 'position' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('phoneNumber')}>
                  Phone {sort.field === 'phoneNumber' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('salary')}>
                  Salary {sort.field === 'salary' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('dateOfJoining')}>
                  Joined {sort.field === 'dateOfJoining' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th} onClick={() => handleSort('isActive')}>
                  Status {sort.field === 'isActive' ? (sort.order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  onEdit={() => navigate(`/employees/edit/${emp.id}`)}
                  onDelete={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
                  onSelect={setSelected}
                  selected={selected}
                />
              ))}
            </tbody>
          </table>

          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
       <span> Page {page} of {totalPages} </span>
       <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>

          <label>{selectedEmployee?.firstName}: {selectedEmployee?.salary}</label>
        </Fragment>
      )}
    </div>
  );
};

// ── INLINE STYLES ──────────────────────────────────────────────────────────
const styles = {
  container: { maxWidth: "1100px", margin: "0 auto", padding: "20px" },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    backgroundColor: "#1a1a2e",
    color: "white",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  navTitle: { margin: 0 },
  navRight: { display: "flex", alignItems: "center", gap: "15px" },
  userName: { fontSize: "14px" },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid white",
    borderRadius: "4px",
    cursor: "pointer",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  th: {
    padding: "12px 15px",
    textAlign: "left",
    backgroundColor: "#f5f5f5",
    fontWeight: "600",
    color: "#333",
    borderBottom: "2px solid #ddd",
  },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "12px 15px", color: "#555" },

  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
  },

  editBtn: {
    padding: "6px 12px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
  },
  deleteBtn: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  loading: { textAlign: "center", padding: "50px", color: "#666" },
  empty: {
    textAlign: "center",
    padding: "50px",
    color: "#999",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
};

export default EmployeeList;
