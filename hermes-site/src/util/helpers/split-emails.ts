export const splitEmails = (input: string) =>
    input.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);