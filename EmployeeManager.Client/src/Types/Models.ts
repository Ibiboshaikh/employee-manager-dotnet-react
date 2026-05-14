export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    phoneNumber: string;
    salary: number;
    dateOfJoining: string;
    isActive: boolean;
}

export interface User {
    id: number;
    username: string;
    fullName: string;
    role: 'Admin' | 'User';
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    fullName: string;
    role: User['role'];
}