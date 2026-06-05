import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/api";
import type { ChangePasswordFormData } from "../schemas/changePasswordSchema";

export const useChangePassword =()=> {
    return useMutation({
        mutationFn: (values: ChangePasswordFormData) => changePassword(values.oldPassword, values.newPassword),
    });
}