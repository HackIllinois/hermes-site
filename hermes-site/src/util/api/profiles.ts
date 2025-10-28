import api from "./api";
import type { UserProfile } from "./types";

export const getUsers = async (): Promise<UserProfile[]> => {
    const { data } = await api.get<UserProfile[]>('/profiles');
    return data;
}