// ============================================================================
// FilterBar.tsx — Controlled filter inputs for the employee list.
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
export interface FilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    department: string;
    onDepartmentChange: (value: string) => void;
    hideBelow50K: boolean;
    onHideBelow50KChange: (checked: boolean) => void;
    view: number;
    onViewChange: (updater: (prev: number) => number) => void;
    departments: string[];
    onClear: () => void;
    minSalary: string;
    onMinSalaryChange: (value: string) => void;
    maxSalary: string;
    onMaxSalaryChange: (value: string) => void;
}
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
    minSalary,
    onMinSalaryChange,
    maxSalary,
    onMaxSalaryChange,
    departments,
    onClear
}: FilterBarProps) => (
    <>
        {/* Department dropdown — value is controlled by prop */}
        <div className="flex flex-wrap items-center gap-3">
        <select className="input w-48" value={department} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onDepartmentChange(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
            ))}
        </select>

        {/* Search input — each keystroke calls onSearchChange + bumps view counter */}
        <input
            type="text"
            className="input w-48"
            placeholder="Search Employees..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onSearchChange(e.target.value);
                onViewChange(v => v + 1);
            }}
        />

        {/* Debug: shows how many search renders have fired since mount */}


        {/* Checkbox — filters out low-salary employees when checked */}
        <input
            type="checkbox"
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            checked={hideBelow50K}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onHideBelow50KChange(e.target.checked)}
        />
        <input type="number" className="input w-48" placeholder="Minimum Salary" value={minSalary} onChange={ (e: React.ChangeEvent<HTMLInputElement>) => onMinSalaryChange(e.target.value)} />
        <input type="number" className="input w-48" placeholder="Maximum Salary" value={maxSalary} onChange={ (e: React.ChangeEvent<HTMLInputElement>) => onMaxSalaryChange(e.target.value)} />
        <button className="btn-secondary" onClick={onClear}>Clear Filters</button>
        <label className="text-sm text-muted dark:text-gray-400">{view}</label>
        </div>
        
    </>
);

export default FilterBar;