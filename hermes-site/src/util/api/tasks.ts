import api from "./api";
import type { Task, TaskStatus } from "./types";

export const getTasks = async (owner_id?: string): Promise<Task[]> => {
    let url = '/tasks';
    
    // If owner_id is provided, add it as a query parameter
    if (owner_id) {
        url += `?owner_id=${owner_id}`;
    }
    // If owner_id is undefined, it will hit /tasks, which defaults to "my tasks"
    
    const { data } = await api.get<Task[]>(url);
    return data;
}

export const createTask = async (payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks/create', payload);
    return data;
}

export const updateTaskStatus = async (taskId: number, status: TaskStatus): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${taskId}`, { status });
    return data;
}