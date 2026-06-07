import { useEffect } from "react";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import clsx from 'clsx';
import { useProfile } from "../Queries/useProfile";
import { useUpdateProfile } from "../Queries/useUpdateProfile";
import { profileSchema, ProfileFormData } from "../schemas/profileSchema";
import { routes } from "../routes";
//import { error } from "node:console";

const ProfileEditPage =() =>{
    const navigate = useNavigate();
    const { data: profile, isLoading } = useProfile();
    const updateMutation = useUpdateProfile();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty, isValid, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        mode: 'onChange',     // re-validate on every keystroke
        defaultValues: { phoneNumber: '' },
    });
    
    useEffect(() => {
        if (profile) {
            reset({ phoneNumber: profile.phoneNumber ?? '', firstName: profile.firstName, lastName: profile.lastName });
        }
    }, [profile, reset]);

    const onSubmit = (values: ProfileFormData) => {
        updateMutation.mutate(values, {
            onSuccess: () => navigate(routes.profile()),
        });
    };

    if (isLoading) return <p className="p-6 text-muted dark:text-gray-400">Loading…</p>;

    const submitDisabled = !isDirty || !isValid || isSubmitting;

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <h1 className="page-title">Edit Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="card space-y-4">
                    <div>
                        <label htmlFor="phoneNumber" className="label">
                            Phone number
                        </label>
                        <input id="phoneNumber" {...register('phoneNumber')} className={clsx(
                            'input', errors.phoneNumber && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        )} />
                        {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="firstName" className="label">
                            First name
                        </label>
                        <input id="firstName" {...register('firstName')} className={clsx(
                            'input', errors.firstName && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        )} />
                        {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="label">
                            Last name
                        </label>
                        <input id="lastName" {...register('lastName')} className={clsx(
                            'input', errors.lastName && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        )} />
                        {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button type="button"
                            className="btn-secondary"
                            onClick={() => navigate(routes.profile())}>
                        Cancel
                    </button>
                    <button type="submit"
                            disabled={submitDisabled}
                            className="btn-primary">
                        {updateMutation.isPending ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEditPage;