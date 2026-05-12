// ============================================================================
// EMPLOYEEROW.JS — Renders a single <tr> for one employee.
//
// Pure display component — no state, no logic. Maps one employee object
// to table cells and wires action buttons to callback props.
//
// PROPS:
//   employee — full employee object { id, firstName, lastName, email, ... }
//   onEdit   — called when user clicks Edit
//   onDelete — called when user clicks Delete
//   onSelect — called when user clicks the row (selects it in parent)
//
// PATTERN: "child renders, parent decides"
//   EmployeeRow doesn't know what Edit/Delete/Select DO. It just tells
//   the parent "the user clicked." The parent owns the response.
// ============================================================================

import React from "react";
import StatusBadge from "./StatusBadge";

const EmployeeRow = ({ employee, onEdit, onDelete, onSelect, selected }) => (
    <tr onClick={() => onSelect(employee.id)} style={{ cursor: "pointer"
    , backgroundColor: employee.id === selected ? "#e8f4fd" : "transparent" }}>
        
        <td>{employee.firstName} {employee.lastName}</td>
        <td>{employee.email}</td>
        <td>{employee.department}</td>
        <td>{employee.position}</td>
        <td>{employee.phoneNumber}</td>
        <td>{employee.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
        {/* toLocaleDateString() converts ISO string → readable date */}
        <td>{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
        {/* StatusBadge is its own component — isActive is all it needs */}
        <td><StatusBadge isActive={employee.isActive} /></td>
        <td>
            <button onClick={() => onEdit(employee)}>Edit</button>
            <button onClick={() => onDelete(employee)}>Delete</button>
        </td>
    </tr>
);

export default EmployeeRow;
