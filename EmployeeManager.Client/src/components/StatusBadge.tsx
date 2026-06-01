// ============================================================================
// StatusBadge.tsx — Displays a colored pill for Active / Inactive status.
//
// Simplest possible component: one prop in, one styled span out.
// Color is derived from the prop — no state needed.
//
// PROPS:
//   employee (Employee) — The employee object containing the isActive status
// ============================================================================
import { Employee } from "../Types/Models";
import clsx from "clsx";

export interface StatusBadgeProps {
    employee: Employee;
}
// Spreads shared badge styles, then overrides backgroundColor per status.
// JS equivalent of: class="badge active" or class="badge inactive"
const StatusBadge = ({ employee }: StatusBadgeProps) => (
    <span className={clsx('inline-block px-2 py-0.5 rounded text-xs font-semibold',
        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700 dark:text-gray-300',
    )}>
        {employee.isActive ? "Active" : "Inactive"}
    </span>
);
export default StatusBadge;
