import {z} from "zod";

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(8, "Old password must be at least 8 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[a-z]/, "New password must contain at least one lowercase letter")
        .regex(/\d/, "New password must contain a digit")
        .regex(/[^a-zA-Z0-9]/, "New password must contain a special character"),
    confirm: z.string().min(1, "please confirm your new password"),
}).refine((data)=> data.newPassword === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match"
}).refine((data) => data.newPassword !== data.oldPassword, {
    path: ["newPassword"],
    message: "New password must be different from the old password"
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;