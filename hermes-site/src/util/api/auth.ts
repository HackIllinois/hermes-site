import api from "./api";
import type { AuthenticatedUser } from "./types";

export const getCurrentUser = async (): Promise<AuthenticatedUser> => {
    const { data } = await api.get<AuthenticatedUser>('/auth/me');
    return data;
}

export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
}
