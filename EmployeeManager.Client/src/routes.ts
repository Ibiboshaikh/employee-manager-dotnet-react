import { EmployeeId } from "./Types/Ids";

export const routes = {
    login: () => "/login" as const,
    employees: () => "/employees" as const,
    newEmployee: () => "/employees/new" as const,
    editEmployee: (id: EmployeeId) => `/employees/${id}/edit` as const,
};