import api from "./api";
import type { Profile } from "./types";

export const getUsers = async (): Promise<Profile[]> => {
  const { data } = await api.get<Profile[]>('/auth/profiles');
  return data.sort((a, b) => a.name.localeCompare(b.name));
}