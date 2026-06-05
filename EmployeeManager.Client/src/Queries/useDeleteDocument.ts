import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteDocument } from "../services/api";
import { documentKeys } from "./documentKeys";
import type { DocumentDTO } from '../Types/Document';

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return deleteDocument(id);
        },
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: documentKeys.mine() });

            const previous = queryClient.getQueryData<DocumentDTO[]>(documentKeys.mine());
            queryClient.setQueryData<DocumentDTO[]>(documentKeys.mine(), 
                (old) => old?.filter(d => d.id !== id) ?? []);
            return { previous };
        },
        onError: (_err, _id, context) => {
            if(context?.previous) {
                queryClient.setQueryData(documentKeys.mine(), context.previous);
            };
            toast.error("Failed to delete document.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: documentKeys.mine() });
        },
    });
}