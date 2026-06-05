import { useQuery } from "@tanstack/react-query";
import { fetchMyDocuments } from "../services/api";
import { documentKeys } from "./documentKeys";

export const useMyDocuments =() =>{
    return useQuery({
        queryKey: documentKeys.mine(),
        queryFn: async () => {
            return (await fetchMyDocuments()).data;
        },
        staleTime: 30 * 1000,
    });
};