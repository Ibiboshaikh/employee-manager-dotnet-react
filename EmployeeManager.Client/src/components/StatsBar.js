// ============================================================================
// STATSBAR.JS — Shows employee count, total salary, and average salary.
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

import React from "react";

const StatsBar = ({ filtered }) => {
    const totalEmployees = filtered.length;
    const totalSalary    = filtered.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary  = totalEmployees > 0
        ? (totalSalary / totalEmployees)
        : 0;

    return (
        <div className="stats-bar">
            <div className="stat">
                <h3>Total Employees</h3>
                <p>{totalEmployees}</p>
            </div>
            <div className="stat">
                <h3>Total Salary</h3>
                <p>{totalSalary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
            <div className="stat">
                <h3>Average Salary</h3>
                <p>{averageSalary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
        </div>
    );
};

export default StatsBar;
