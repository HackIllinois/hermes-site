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