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
        'w-full rounded shadow-sm',
        hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500',
    );

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Change Password</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 card">
                {errors.root && 
                    <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                        {errors.root.message}
                    </div>
                }
                <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input type="password" {...register("oldPassword")}
                        className={inputClass(!!errors.oldPassword)} />
                    {errors.oldPassword && <p className="text-red-600 text-sm mt-1">{errors.oldPassword.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input type="password" {...register("newPassword")}
                        className={inputClass(!!errors.newPassword)} />
                    {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input type="password" {...register("confirm")}
                        className={inputClass(!!errors.confirm)} />
                    {errors.confirm && <p className="text-red-600 text-sm mt-1">{errors.confirm.message}</p>}
                </div>
                <div className="flex gap-2 justify-end">
                    <button type="submit" disabled={!isValid || isSubmitting || mutation.isPending } className="btn-primary w-full">
                        {mutation.isPending ? "Changing..." : "Change Password"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordPage;