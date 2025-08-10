import api from "./api";
import type { Sponsor } from "./types";

// Replace BASE_URL and path strings with your backend routes.
export const getSponsors = async (): Promise<Sponsor[]> => {
  const { data } = await api.get<Sponsor[]>('/sponsors');
  return data;
}

export const createSponsor = async (payload: Sponsor): Promise<Sponsor> => {
  const { data } = await api.post<Sponsor>('/sponsors/create', payload);
  return data;
}

// TODO: Implement this function.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateSponsor = async (sponsor_email: string, payload: Partial<Sponsor>): Promise<Sponsor> => {
  console.log('Functionality not implemented yet.');
  return {
    company_name: '',
    created_at: '',
    notes: '',
    sponsor_email: sponsor_email,
    sponsor_name: '',
    status: 'PENDING_EMAIL',
    updated_at: '',
  };
}

// TODO: Implement this function.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteSponsor = async (sponsor_email: string): Promise<void> => {
  console.log('Functionality not implemented yet.');
}