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
    <span className={clsx('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
        employee.isActive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    )}>
        {employee.isActive ? "Active" : "Inactive"}
    </span>
);
export default StatusBadge;
