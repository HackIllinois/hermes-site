export interface Email {
    direction: 'INBOUND' | 'OUTBOUND';
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
    to: string[];
    cc: string[] | null;
    bcc: string[] | null;
}

export interface EmailReply {
    email_thread_id: number;
    message_id_to_reply_to: string;
    body: string;
    reply_type: "REPLY" | "REPLY_ALL";
    cc: string[] | null;
    bcc: string[] | null;
}

export interface SendEmailResponse {
    message: string;
    data: {
        message_id: string;
        thread_id: string;
    }
    response_status: number;
}

export interface EmailReplyResponse {
    message: string;
    response_status: number;
}
export interface EmailScheduleRequest {
    email_thread_id?: number;
    contact_task_id?: number;
    send_at: string; // A stringified Unix timestamp
    job_data: SendEmail | EmailReply; // The payload will be one of these
}

export interface ScheduledSendTableResponse {
    id: number;
    contact_task_id: number;
    created_at: string;
    send_at: string; // This is an ISO 8601 string
    status: 'PENDING' | 'SENT' | 'ERROR';
    job_data: SendEmail | EmailReply; // The frontend will parse this
    error_log: string | null;
}

export interface TaskEmailHistory {
    sent_emails: Email[];
    scheduled_sends: ScheduledSendTableResponse[];
}

export interface Task {
    id: number;
    sponsor_email: string;
    owner_id: string;
    due_date: string;
    notes: string;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
    sponsors: Sponsor | null;
    team?: {
        default_contact_email: string | null;
    } | null;
}

export type TaskStatus = "PENDING_EMAIL" | "SENT" | "NEEDS_REPLY" | "BUMP_1" | "BUMP_2" | "BUMP_3" | "REJECTED" | "GHOSTED" | "INVALID_CONTACT" | "DEFERRED";
export const TASK_STATUSES: TaskStatus[] = [
    "PENDING_EMAIL",
    "SENT",
    "NEEDS_REPLY",
    "BUMP_1",
    "BUMP_2",
    "BUMP_3",
    "REJECTED",
    "GHOSTED",
    "INVALID_CONTACT",
    "DEFERRED",
];

export const TASK_STATUS_DISPLAY_NAMES: Record<TaskStatus, string> = {
    "PENDING_EMAIL": "Pending Email",
    "SENT": "Sent",
    "NEEDS_REPLY": "Needs Reply",
    "BUMP_1": "Bump 1",
    "BUMP_2": "Bump 2",
    "BUMP_3": "Bump 3",
    "REJECTED": "Rejected",
    "GHOSTED": "Ghosted",
    "INVALID_CONTACT": "Invalid Contact",
    "DEFERRED": "Deferred",
};


export type Sponsor = {
    company_name: string | null;
    created_at: string | null;
    notes: string | null;
    sponsor_email: string;
    sponsor_name: string;
    status: SponsorStatus;
    updated_at: string | null;
    contact_tasks: SponsorTask[];
}

export type SponsorStatus = "NOT_CONTACTED" | "CONTACTED" | "REJECTED" | "NEED_PAYMENT" | "CONFIRMED" | "INVALID_CONTACT" | "DEFERRED";
export const SPONSOR_STATUSES: SponsorStatus[] = [
    "NOT_CONTACTED",
    "CONTACTED",
    "REJECTED",
    "NEED_PAYMENT",
    "CONFIRMED",
    "INVALID_CONTACT",
    "DEFERRED",
];

export const SPONSOR_STATUS_DISPLAY_NAMES: Record<SponsorStatus, string> = {
    "NOT_CONTACTED": "Not Contacted",
    "CONTACTED": "Contacted",
    "REJECTED": "Rejected",
    "NEED_PAYMENT": "Need Payment",
    "CONFIRMED": "Confirmed",
    "INVALID_CONTACT": "Invalid Contact",
    "DEFERRED": "Deferred",
};

type SponsorStatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';

export const SPONSOR_STATUS_COLORS: Record<SponsorStatus, SponsorStatusColor> = {
    'CONFIRMED': 'success',
    'NEED_PAYMENT': 'warning',
    'REJECTED': 'error',
    'CONTACTED': 'info',
    'NOT_CONTACTED': 'default',
    'INVALID_CONTACT': 'error',
    'DEFERRED': 'info',
}

type SponsorTaskOwner = {
    id: string;
    name: string;
};

type SponsorTask = {
    id: number;
    status: TaskStatus;
    profiles: SponsorTaskOwner | null; // Will be null if task has no owner
};

export interface UserProfile {
    id: string;
    name: string;
}

export interface Team {
    id: number;
    name: string;
}

export interface AuthenticatedUser {
    id: string;
    email: string | null;
    role: 'LEAD' | 'MEMBER';
    team_id: number | null;
}

export interface Template {
    id: number;
    user_id: string;
    template_name: string;
    subject: string | null;
    body: string | null;
    created_at: string;
    updated_at: string;
}
