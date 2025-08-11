

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