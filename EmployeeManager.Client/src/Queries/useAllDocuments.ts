import { useQuery } from "@tanstack/react-query";
import { fetchAllDocuments } from "../services/api";
import { documentKeys } from "./documentKeys";
import { useAuth } from '../Context/AuthContext';

export const useAllDocuments = () =>{
    const { user } = useAuth();
    return useQuery({
        queryKey: documentKeys.allAdmin(),
        queryFn: async () => { 
            return (await fetchAllDocuments()).data; 
        },
        enabled: user?.role === 'Admin',
        staleTime: 30 * 1000,
    });
};