import { SetURLSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Employee } from "../Types/Models";

function useEmployeeFilter(
  employees: Employee[],
  searchParam: URLSearchParams,
  setSearchParam: SetURLSearchParams
) {
    const search = searchParam.get("search") || "";
    const department = searchParam.get("department") || "";
    const hideBelow50K = searchParam.get("hideBelow50K") === "true";
    const minSalary = searchParam.get("minSalary") || "";
    const maxSalary = searchParam.get("maxSalary") || "";

    const updateParam = (key: string, value: string | boolean) => {
      const newParams = new URLSearchParams(searchParam.toString());
      if(!value || value === "false") {
        newParams.delete(key);
      }
      else{
        newParams.set(key, String(value));
      }
      setSearchParam(newParams, { replace: true });
    };
    const setSearch = (value: string) => updateParam("search", value);
    const setDepartment = (value: string) => updateParam("department", value);
    const sethideBelow50K = (value: boolean) => updateParam("hideBelow50K", value);
    const setMinSalary = (value: string) => updateParam("minSalary", value);
    const setMaxSalary = (value: string) => updateParam("maxSalary", value);


    useEffect(() => {
    localStorage.setItem('search', search);
  }, [search])

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