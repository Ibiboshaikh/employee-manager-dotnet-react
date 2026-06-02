import { useMutation, useQueryClient } from "@tanstack/react-query";
import {toast} from "react-toastify";
import { isAxiosError } from "axios";
import { updateProfile } from "../services/api";
import { profileKeys } from "./profileKeys";
//import type { Profile } from "../Types/Profile";
import type { ProfileFormData } from "../schemas/profileSchema";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: ProfileFormData) => updateProfile(values),
        onSuccess: (Response) =>{
            queryClient.setQueryData(profileKeys.me(), Response.data);
            toast.success("Profile updated successfully");
        },
        onError: (err) =>{
            const msg = isAxiosError(err) ? err.response?.data?.message || "Failed to update profile" : "Failed to update profile";
            toast.error(msg);
        }
    });
};