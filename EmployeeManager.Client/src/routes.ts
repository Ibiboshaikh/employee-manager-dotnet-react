import { EmployeeId } from "./Types/Ids";

export const routes = {
    login: () => "/login" as const,
    employees: () => "/employees" as const,
    testForm: () => "/TestForm" as const,
    newEmployee: () => "/employees/new" as const,
    editEmployee: (id: EmployeeId) => `/employees/${id}/edit` as const,
    forceChangePassword: () => "/force-change-password" as const,
    forbidden: () => "/forbidden" as const,
    profile: () => "/profile" as const,
    profileEdit: () => "/profile/edit" as const,
    changePassword: () => "/profile/change-password" as const,
    forgotPassword: () => '/forgot-password' as const,
    resetPassword: (token: string) => `/reset-password/${token}` as const,
    myDocuments: () => '/documents' as const,
};