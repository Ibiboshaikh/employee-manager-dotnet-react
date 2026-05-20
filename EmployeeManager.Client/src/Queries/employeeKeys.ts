import { EmployeeId } from "../Types/Ids";
export const employeeKeys = {
    all: ['employees'] as const,
    detail: (id: EmployeeId) => ['employees', id] as const,
};