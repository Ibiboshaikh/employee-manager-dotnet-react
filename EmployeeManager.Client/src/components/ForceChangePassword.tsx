import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { changePassword } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { routes } from "../routes";

const ForceChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { clearMustChangePassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(newPassword !== confirm){
            toast.error("New password and confirmation do not match");
            return;
        }
        if(newPassword.length < 8){
            toast.error("New password must be at least 8 characters long");
            return;
        }
        setSubmitting(true);
        try {
            await changePassword(oldPassword, newPassword);
            clearMustChangePassword();
            toast.success("Password changed successfully");
            navigate(routes.employees(), { replace: true });
        } catch (err){
            const msg = isAxiosError<{ message?: string}>(err) ? err.response?.data.message 
            || "Failed to change password" : "An unexpected error occurred";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return(
        <div style={{maxWidth: 400, margin: '80px auto', padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            <h2>Set a new password</h2>
            <p style={{ color: '#666'}}>
                You're using a temporary password. Choose a permanent one before continuing.
            </p>
            <form onSubmit={handleSubmmit}>
                <input type="password" placeholder="current password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    required style={{width: '100%', padding: 10, marginBottom: 12}} />

                <input type="password" placeholder="new password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    required style={{width: '100%', padding: 10, marginBottom: 12}} />

                <input type="password" placeholder="confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    required style={{width: '100%', padding: 10, marginBottom: 12}} />

                <button type="submit" disabled={submitting} className="btn-success">
                    {submitting ? 'Saving...' : 'Change password'}
                </button>
            </form>
        </div>
    );
}

export default ForceChangePassword;