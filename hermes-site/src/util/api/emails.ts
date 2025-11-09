import api from "./api";
import type { Email, EmailReply, EmailReplyResponse, EmailScheduleRequest, SendEmail, SendEmailResponse } from "./types";

export const getEmails = async (taskId: number): Promise<Email[]> => {
    const { data } = await api.get<Email[]>(`/emails/task/${taskId}`);
    return data;
}

export const sendEmail = async (payload: SendEmail): Promise<SendEmailResponse> => {
    const { data, status } = await api.post<SendEmailResponse>("/emails/send", payload);
    data.response_status = status;
    return data;
};

export const scheduleEmail = async (payload: EmailScheduleRequest) => {
    const { data } = await api.post("/emails/schedule", payload);
    return data;
};

export const replyToEmail = async (payload: EmailReply): Promise<EmailReplyResponse> => {
    const { data, status } = await api.post<SendEmailResponse>("/emails/reply", payload);
    data.response_status = status;
    return data;
};

/**
 * Calls the backend to create or renew the Gmail push notification watch.
 * This should be called once when the app loads.
 */
export const watchEmailSync = async () => {
    const { data } = await api.post('/emails/watch');
    return data;
};