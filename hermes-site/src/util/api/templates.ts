import api from "./api";
import type { Template } from "./types";

export const getTemplates = async (): Promise<Template[]> => {
    const response = await api.get<Template[]>("/templates");
    return response.data;
};

export const createTemplate = async (template: Partial<Template>): Promise<Template> => {
    const response = await api.post<Template>("/templates", template);
    return response.data;
};

export const updateTemplate = async (id: number, template: Partial<Template>): Promise<Template> => {
    const response = await api.put<Template>(`/templates/${id}`, template);
    return response.data;
};

export const deleteTemplate = async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/templates/${id}`);
    return response.data;
};