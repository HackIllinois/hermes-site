import api from "./api";
import type { TaskInsert, CreateTaskResponse } from "./types";

export const createTask = async (payload: TaskInsert): Promise<CreateTaskResponse> => {
  const { data } = await api.post<CreateTaskResponse>("/tasks", payload);
  return data;
};