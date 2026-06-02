import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import {profileKeys} from "./profileKeys";
import type { Profile } from "../Types/Profile";

export const useProfile = () =>{
    return useQuery({
        queryKey: profileKeys.me(),
        queryFn: async () => {
            const response = await api.get<Profile>("/profile");
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}