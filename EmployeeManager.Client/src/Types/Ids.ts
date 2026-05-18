declare const employeeIdBrand: unique symbol;
declare const userIdBrand: unique symbol;


export type EmployeeId = string & { readonly [employeeIdBrand]: true };
export type UserId = string & { readonly [userIdBrand]: true };

export function toEmployeeId(id: string): EmployeeId {
    return id as EmployeeId;
}

export function toUserId(id: string): UserId {
    return id as UserId;
}