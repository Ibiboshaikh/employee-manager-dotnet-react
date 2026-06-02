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

    if (isLoading) return <p className="p-6 text-gray-500">Loading…</p>;

    const submitDisabled = !isDirty || !isValid || isSubmitting;

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 card">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Phone number
                    </label>
                    <input id="phoneNumber" {...register('phoneNumber')} className={clsx(
                        'w-full rounded shadow-sm', errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
                    )} />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                </div>
                <div className="space-y-4 card">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        First name
                    </label>
                    <input id="firstName" {...register('firstName')} className={clsx(
                        'w-full rounded shadow-sm', errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
                    )} />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-4 card">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Last name
                    </label>
                    <input id="lastName" {...register('lastName')} className={clsx(
                        'w-full rounded shadow-sm', errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
                    )} />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
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