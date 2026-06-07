// ============================================================================
// StatsBar.tsx — Shows employee count, total salary, and average salary.
//
// Receives the filtered employees array and derives all display values
// itself. The parent does NOT pre-compute these — it just passes the array.
//
// PROPS:
//   filtered — array of employee objects after all filters have been applied
//
// PATTERN: "derive don't store"
//   totalEmployees, totalSalary, averageSalary are plain consts — not state.
//   Re-computed on every render from `filtered`. That's correct because
//   they're always derivable; storing them in state would be redundant.
// ============================================================================

import { Employee } from "../Types/Models";

interface StatsBarProps {
    filtered: Employee[]; // Array of employees after filtering (from parent)
}
const StatsBar = ({ filtered }: StatsBarProps ) => {
    const totalEmployees = filtered.length;
    const totalSalary    = filtered.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary  = totalEmployees > 0
        ? (totalSalary / totalEmployees)
        : 0;

    const currency = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const stats = [
        { label: 'Total Employees', value: totalEmployees.toLocaleString('en-US') },
        { label: 'Total Salary', value: currency(totalSalary) },
        { label: 'Average Salary', value: currency(averageSalary) },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="rounded-xl border border-line dark:border-gray-700 bg-[#f5f7fa] dark:bg-gray-800 px-5 py-4"
                >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-gray-400">
                        {s.label}
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-navy-900 dark:text-gray-100 truncate">
                        {s.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default StatsBar;