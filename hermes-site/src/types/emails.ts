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