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

export type SponsorStatus = "PENDING_EMAIL" | "CONTACTED" | "REJECTED" | "NEED_PAYMENT" | "CONFIRMED";
export const SPONSOR_STATUSES: SponsorStatus[] = [
    "PENDING_EMAIL",
    "CONTACTED",
    "REJECTED",
    "NEED_PAYMENT",
    "CONFIRMED",
];

export const SPONSOR_STATUS_DISPLAY_NAMES: Record<SponsorStatus, string> = {
    "PENDING_EMAIL": "Pending Email",
    "CONTACTED": "Contacted",
    "REJECTED": "Rejected",
    "NEED_PAYMENT": "Need Payment",
    "CONFIRMED": "Confirmed",
};

type SponsorStatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';

export const SPONSOR_STATUS_COLORS: Record<SponsorStatus, SponsorStatusColor> = {
    'CONFIRMED': 'success',
    'NEED_PAYMENT': 'warning',
    'REJECTED': 'error',
    'CONTACTED': 'info',
    'PENDING_EMAIL': 'default',
}

export type Sponsor = {
    company_name: string | null;
    created_at: string | null;
    notes: string | null;
    sponsor_email: string;
    sponsor_name: string;
    status: SponsorStatus;
    updated_at: string | null;
}