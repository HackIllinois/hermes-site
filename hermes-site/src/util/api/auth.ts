import api from "./api";
import type { AuthenticatedUser } from "./types";

export const getCurrentUser = async (): Promise<AuthenticatedUser> => {
    const { data } = await api.get<AuthenticatedUser>('/auth/me');
    return data;
}
