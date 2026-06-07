import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { isAxiosError } from "axios";
import clsx from "clsx";
import { useAuth } from "../Context/AuthContext";
import { useChangePassword } from "../Queries/useChangePassword";
import { changePasswordSchema, ChangePasswordFormData } from "../schemas/changePasswordSchema";
import { routes } from "..//routes";

const ChangePasswordPage = () =>{
    const navigate = useNavigate();
    const { logout } = useAuth();
    const mutation = useChangePassword();

    const { register, handleSubmit, setError, formState: {errors, isValid, isSubmitting}, }  = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues:{
            oldPassword: "",
            newPassword: "",
            confirm: "",
        }
    });

    const onSubmit = async (values: ChangePasswordFormData) =>{
        mutation.mutate(values, {
            onSuccess: () => {
                toast.success("Password changed successfully. Please log in again.");
                logout();
                navigate(routes.login(), {replace: true});
            },
            onError: (err) => {
                if(isAxiosError<{errors?: string[]; message?: string}>(err)){
                    const errors = err.response?.data?.errors;
                    if(errors && errors.length > 0){ 
                        setError('root', {
                            type: "server",
                            message: errors.join(" "),
                        });
                        return;
                    }
                    setError('root', {
                        type: "server",
                        message: err.response?.data?.message || "Failed to change password",
                    });
                    return;
                }
                setError('root', { type: 'server', message: 'Failed to change password.' });
            }
        });
    };

    const inputClass = (hasError: boolean) => clsx(
        'input',
        hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    );

    return (
        <div className="auth-shell">
            <form onSubmit={handleSubmit(onSubmit)} className="auth-card space-y-4">
                <h1 className="page-title text-center">Change Password</h1>
                {errors.root &&
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                        {errors.root.message}
                    </div>
                }
                <div>
                    <label className="label">Current Password</label>
                    <input type="password" {...register("oldPassword")}
                        className={inputClass(!!errors.oldPassword)} />
                    {errors.oldPassword && <p className="text-red-600 text-sm mt-1">{errors.oldPassword.message}</p>}
                </div>
                <div>
                    <label className="label">New Password</label>
                    <input type="password" {...register("newPassword")}
                        className={inputClass(!!errors.newPassword)} />
                    {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>}
                </div>
                <div>
                    <label className="label">Confirm New Password</label>
                    <input type="password" {...register("confirm")}
                        className={inputClass(!!errors.confirm)} />
                    {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
                </div>
                <button type="submit" disabled={!isValid || isSubmitting || mutation.isPending } className="btn-primary w-full">
                    {mutation.isPending ? "Changing..." : "Change Password"}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;