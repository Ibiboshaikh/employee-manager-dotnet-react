import { createContext, useContext, useState, ReactNode } from "react";
import { LoginResponse } from "../Types/Models";

interface AuthContextType {
    user: LoginResponse | null;
    login: (userData: LoginResponse, token: string) => void;
    logout: () => void;
    clearMustChangePassword: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LoginResponse | null>(() => {
    try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        return null; // Fallback safely if JSON is corrupt
    }
});

    const login = (userData: LoginResponse, token: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    }

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    }

    const clearMustChangePassword = () => {
        setUser(prev => {
            if(!prev) return prev; // No user, nothing to update
            const updated = {...prev, mustChangePassword: false };
            localStorage.setItem('user', JSON.stringify(updated)); // Sync to localStorage
            return updated;
        });
    }

    return(
        <AuthContext.Provider value={{ user, login, logout, clearMustChangePassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
