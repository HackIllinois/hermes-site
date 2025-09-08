export interface Email {
    gmail_message_id: string;
    sender_email: string;
    to_recipients: string[];
    cc_recipients: string[] | null;
    bcc_recipients: string[] | null;
    sent_at: string | null;
    subject: string;
    body: string;
    thread_id?: number;
}

export interface SendEmail {
    contact_task_id: number;
    subject: string;
    body: string;
    to_recipients: string[];
    cc_recipients: string[] | null;
    bcc_recipients: string[] | null;
}

export interface SendEmailResponse {
    message: string;
    data: {
        message_id: string;
        thread_id: string;
    }
    response_status: number;
}


export interface Task {
    id: number;
    sponsor_email: string;
    owner_id: string;
    due_date: string;
    notes: string;
    status: 'PENDING' | 'SENT' | 'FOLLOWED_UP' | 'COMPLETED' | 'REPLIED' | 'BUMP_1' | 'BUMP_2' | 'BUMP_3';
    created_at: string;
    updated_at: string;
}