import {z} from "zod";

export const profileSchema = z.object({
    phoneNumber: z.string().trim().min(10, "Phone number must be at least 10 digits")
        .max(10, "Phone number must be at most 10 digits"),
    firstName: z.string().trim().min(2, "First name must be at least 2 characters")
        .max(16, "First name must be at most 16 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters")
        .max(16, "Last name must be at most 16 characters"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;