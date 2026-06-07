import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { changePassword } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { routes } from "../routes";

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', marginBottom: 12,
    border: '1px solid #e4e8ee', borderRadius: 10, fontSize: 14,
    boxSizing: 'border-box',
};

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
        <div style={{maxWidth: 400, margin: '80px auto', padding: 28, background: 'white', borderRadius: 16, boxShadow: '0 24px 60px -24px rgba(11,31,58,0.4)'}}>
            <h2>Set a new password</h2>
            <p style={{ color: '#5b6675', marginBottom: 16}}>
                You're using a temporary password. Choose a permanent one before continuing.
            </p>
            <form onSubmit={handleSubmmit}>
                <input type="password" placeholder="current password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    required style={inputStyle} />

                <input type="password" placeholder="new password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    required style={inputStyle} />

                <input type="password" placeholder="confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    required style={inputStyle} />

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Saving...' : 'Change password'}
                </button>
            </form>
        </div>
    );
}

export default ForceChangePassword;