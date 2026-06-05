import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {  isAxiosError } from "axios";
import { resetPassword } from "../services/api";
import { routes } from "../routes";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const { token = '' } = useParams<{ token: string }>();
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPassword !== confirm) {
            toast.error("Passwords do not match");
            return;
        }
        
        setSubmitting(true);
        try {
            await resetPassword(token, newPassword);
            toast.success("Password reset successfully. Please log in.");
            navigate(routes.login(), { replace: true });
                    
        } catch (err) {
            const msg = isAxiosError<{ errors?: string[]; message?: string }>(err)
                ? err.response?.data?.errors?.join(' ')
                ?? err.response?.data?.message
                ?? 'Reset failed.'
                : 'Reset failed.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Reset password</h1>
            <form onSubmit={handleSubmit} className="space-y-4 card">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="New Password" required className="w-full rounded border-gray-300" />
                
                <input type="password" value={confirm} onChange={e=> setConfirm(e.target.value)}
                    placeholder="confirm password" required className="w-full rounded border-gray-300" />

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? "Submitting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;