export const isValidEmail = (v: string) => {
  return /\S+@\S+\.\S+/.test(v);
}