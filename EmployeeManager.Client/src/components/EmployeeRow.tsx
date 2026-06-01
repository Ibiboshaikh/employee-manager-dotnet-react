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
import { EmployeeId } from "../Types/Ids";
import clsx from "clsx";

export interface EmployeeRowProps {
    employee: Employee;
    onEdit: (id: EmployeeId) => void;
    onDelete: (id: EmployeeId, name: string) => void;
    onSelect: (id: EmployeeId) => void;
    selected: EmployeeId | null;
}

const EmployeeRow = ({ employee, onEdit, onDelete, onSelect, selected }: EmployeeRowProps) => (
  <tr
    onClick={() => onSelect(employee.id)}
    className={clsx('cursor-pointer', employee.id === selected ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800')}>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.firstName} {employee.lastName}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.email}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.department}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.position}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.phoneNumber}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.salary.toLocaleString("en-US", { style: "currency", currency: "USD" })}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"><StatusBadge employee={employee} /></td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
      <button className="btn-secondary" onClick={() => onEdit(employee.id)}>Edit</button>
      <button className="btn-danger ml-2" onClick={() => onDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}>
        Delete
      </button>
    </td>
  </tr>
);

export default memo(EmployeeRow);