// ============================================================================
// EmployeeRow — renders one <tr> for one employee.
//
// Pure display component — no state, no logic. Maps the employee object to
// table cells and wires action buttons to callback props the parent owns.
//
// Wrapped in React.memo so the row only re-renders when its props change.
// For memo to work, the parent must pass stable callback identities
// (useCallback for onEdit/onDelete in EmployeeList).
//
// PATTERN: "child renders, parent decides" — the row just signals clicks.
// ============================================================================

import { memo } from "react";
import StatusBadge from "./StatusBadge";
import { Employee } from "../Types/Models";
export interface EmployeeRowProps {
    employee: Employee;
    onEdit: (id: string) => void;
    onDelete: (id: string, name: string) => void;
    onSelect: (id: string) => void;
    selected: string | null;
}

const EmployeeRow = ({ employee, onEdit, onDelete, onSelect, selected }: EmployeeRowProps) => (
  <tr
    onClick={() => onSelect(employee.id)}
    style={{
      cursor: "pointer",
      backgroundColor: employee.id === selected ? "#e8f4fd" : "transparent",
    }}
  >
    <td>{employee.firstName} {employee.lastName}</td>
    <td>{employee.email}</td>
    <td>{employee.department}</td>
    <td>{employee.position}</td>
    <td>{employee.phoneNumber}</td>
    <td>{employee.salary.toLocaleString("en-US", { style: "currency", currency: "USD" })}</td>
    <td>{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
    <td><StatusBadge employee={employee} /></td>
    <td>
      <button onClick={() => onEdit(employee.id)}>Edit</button>
      <button onClick={() => onDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}>
        Delete
      </button>
    </td>
  </tr>
);

export default memo(EmployeeRow);
