import api from "./api";
import type { Task } from "./types";

export const getTasks = async (): Promise<Task[]> => {
    const { data } = await api.get<Task[]>('/tasks');
    return data;
}