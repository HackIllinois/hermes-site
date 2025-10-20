import api from "./api";
import type { Email, SendEmail, SendEmailResponse } from "./types";

export const getEmails = async (taskId: number): Promise<Email[]> => {
    const { data } = await api.get<Email[]>(`/emails/task/${taskId}`);
    return data;
}

export const sendEmail = async (payload: SendEmail): Promise<SendEmailResponse> => {
    const { data, status } = await api.post<SendEmailResponse>("/tasks", payload);
    data.response_status = status;
    return data;
};