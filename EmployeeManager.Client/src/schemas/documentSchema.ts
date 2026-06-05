import { z } from "zod";

export const MAX_DOCUMENT_BYTES = 5_000_000;
export const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
] as const;

export const documentFileSchema = z.instanceof(File, {message: 'Please select a file.'})
    .refine((file) => file.size <= MAX_DOCUMENT_BYTES, {message: `File must be ≤ ${MAX_DOCUMENT_BYTES / 1_000_000} MB.` })
    .refine((file) => ALLOWED_DOCUMENT_TYPES.includes
        (file.type as typeof ALLOWED_DOCUMENT_TYPES[number]), 
        { message: 'Only PDF, text, and image files are allowed.' }
);

export const validateDocumentFile = (file: File): string[] => {
    const result = documentFileSchema.safeParse(file);
    if (result.success) return [];
    return result.error.issues.map(e => e.message);
};