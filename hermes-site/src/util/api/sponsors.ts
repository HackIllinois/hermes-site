import api from "./api";
import type { Sponsor } from "./types";

export const getSponsors = async (): Promise<Sponsor[]> => {
  const { data } = await api.get<Sponsor[]>('/sponsors');
  return data;
}

export const createSponsor = async (payload: Sponsor): Promise<Sponsor> => {
  const { data } = await api.post<Sponsor>('/sponsors/create', payload);
  return data;
}

export const updateSponsor = async (sponsor_email: string, updates: Partial<Sponsor>): Promise<Sponsor> => {
  const { data } = await api.patch<Sponsor>(`/sponsors/${encodeURIComponent(sponsor_email)}`, updates);
  return data;
}

export const deleteSponsor = async (sponsor_email: string): Promise<void> => {
  await api.delete(`/sponsors/${encodeURIComponent(sponsor_email)}`);
}