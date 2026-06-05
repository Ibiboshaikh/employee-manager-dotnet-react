import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { uploadAvatar } from "../services/api";
import { profileKeys } from "../Queries/profileKeys";

const MAX_BYTES = 3_000_000; // 3MB

const AvatarUpload = ({ currentUrl }: { currentUrl?: string }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        return() =>{
            if(preview) URL.revokeObjectURL(preview);
        }
    }, [preview]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Pick an image.');
            return;
        }
        if (file.size > MAX_BYTES) {
            toast.error('Image too large (max 2MB).');
            return;
        }

        setPreview(URL.createObjectURL(file));
        setSubmitting(true);

        try {
            var response =await uploadAvatar(file);
            queryClient.setQueryData(profileKeys.me(), response.data);
            toast.success('Avatar updated!');
        } catch(err) {
            const msg = isAxiosError<{message: string}>(err) ? err.response?.data?.message ?? 'Upload failed.' : 'Upload failed.';
            toast.error(msg);
            setPreview(null);
        } finally {
            setSubmitting(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    const displayed = preview ?? currentUrl;

    return (
        <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {displayed ? 
                    <img src={displayed} alt="Avatar" className="w-full h-full object-cover" />:
                    <span className="text-gray-500 dark:text-gray-400">No Avatar</span>
                }
            </div>
            <div>
                <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" id="avatar-input"/>
                <label htmlFor="avatar-input" className="btn-secondary cursor-pointer">
                    {submitting ? 'Uploading…' : 'Change avatar'}
                </label>
            </div>
        </div>
    );
}

export default AvatarUpload;