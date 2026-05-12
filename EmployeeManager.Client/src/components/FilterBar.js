// ============================================================================
// FILTERBAR.JS — Controlled filter inputs for the employee list.
//
// This is a "controlled" component — it owns NO state. All current values
// come in as props, all changes go back up via callback props.
//
// ANALOGY TO .NET:
//   Like a form whose model lives in the controller. The view (FilterBar)
//   only renders what it's given and reports what the user typed.
//
// PROPS IN (values to display):
//   search       — current search text
//   department   — currently selected department
//   hideBelow50K — checkbox state (bool)
//   view         — render counter (debug: shows how many times search fired)
//   departments  — array of unique department strings for the dropdown
//
// CALLBACKS OUT (called when the user changes something):
//   onSearchChange(value)
//   onDepartmentChange(value)
//   onHideBelow50KChange(checked)
//   onViewChange(updater)
// ============================================================================

import React from "react";

// FilterBar never calls useState — EmployeeList owns all filter state.
const FilterBar = ({
    search,
    onSearchChange,
    department,
    onDepartmentChange,
    hideBelow50K,
    onHideBelow50KChange,
    view,
    onViewChange,
    departments,
    onClear,
    minSalary,
    onMinSalaryChange,
    maxSalary,
    onMaxSalaryChange
}) => (
    <>
        {/* Department dropdown — value is controlled by prop */}
        <select value={department} onChange={e => onDepartmentChange(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
            ))}
        </select>

        {/* Search input — each keystroke calls onSearchChange + bumps view counter */}
        <input
            type="text"
            placeholder="Search Employees..."
            value={search}
            onChange={e => {
                onSearchChange(e.target.value);
                onViewChange(v => v + 1);
            }}
        />

        {/* Debug: shows how many search renders have fired since mount */}
        <label>{view}</label>

        {/* Checkbox — filters out low-salary employees when checked */}
        <input
            type="checkbox"
            checked={hideBelow50K}
            onChange={e => onHideBelow50KChange(e.target.checked)}
        />
        <input type="number" placeholder="Minimum Salary" value={minSalary} onChange={ e => onMinSalaryChange(e.target.value)} />
        <input type="number" placeholder="Maximum Salary" value={maxSalary} onChange={ e => onMaxSalaryChange(e.target.value)} />
        <button onClick={onClear}>Clear Filters</button>
    </>
);

export default FilterBar;
