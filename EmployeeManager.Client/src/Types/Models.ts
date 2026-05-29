import { EmployeeId, UserId } from "./Ids";
export interface Employee {
    id: EmployeeId;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    phoneNumber: string;
    salary: number;
    dateOfJoining: string;
    isActive: boolean;
    mustChangePassword: boolean;
}

export interface User {
    id: UserId;
    username: string;
    fullName: string;
    role: 'Admin' | 'User';
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    expiresIn: number; // Token lifetime in seconds
    fullName: string;
    role: User['role'];
}