import { useState, useEffect } from "react";
import { Employee } from "../Types/Models";
function useEmployeeFilter(employees: Employee[]) {
    const [search, setSearch] = useState(
    ()=> localStorage.getItem('search') || ''
  );

  useEffect(() => {
    localStorage.setItem('search', search);
  }, [search])
    const [department, setDepartment] = useState('');
    const [hideBelow50K, sethideBelow50K] = useState(false);
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');

    const filtered = employees
    .filter(emp =>
      `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.department}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(emp => !department || emp.department === department)
    .filter(emp => !hideBelow50K || emp.salary >= 900)
    .filter(emp => !minSalary || emp.salary >= parseFloat(minSalary))
    .filter(emp => !maxSalary || emp.salary <= parseFloat(maxSalary));

    return {
        search, setSearch,
        department, setDepartment,
        hideBelow50K, sethideBelow50K,
        minSalary, setMinSalary,
        maxSalary, setMaxSalary,
        filtered,
      };
}
export default useEmployeeFilter;