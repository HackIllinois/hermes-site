export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const isValidEmail = (v: string) => {
    return emailRegex.test(v);
}