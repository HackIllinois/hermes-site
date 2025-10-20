export const normalizeEmails = (list: string[]) =>
    Array.from(new Set(list.map((e) => e.trim().toLowerCase()).filter(Boolean)));