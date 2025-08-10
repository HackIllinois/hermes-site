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

type UserRole = "LEAD" | "MEMBER";

export type Profile = {
    created_at: string | null;
    gmail_refresh: string | null;
    gmail_token: string | null;
    id: string;
    last_history_id: string | null;
    last_synced_at: string | null;
    name: string;
    role: UserRole;
    updated_at: string | null;
}

export type TaskStatus = "PENDING" | "SENT" | "FOLLOWED_UP" | "COMPLETED" | "REPLIED";

export interface TaskInsert {
  sponsor_email: string;
  owner_id: string;
  due_date: string; // unix ms timestamp as string
  notes?: string;
  status?: TaskStatus;
}

export type CreateTaskResponse = {
  message: string;
  task_id: number;
};
