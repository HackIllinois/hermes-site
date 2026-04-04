import api from "./api";
import type { Team, UserProfile } from "./types";

export const getUsers = async (): Promise<UserProfile[]> => {
    const { data } = await api.get<UserProfile[]>('/profiles');
    return data;
}

export const getTeams = async (): Promise<Team[]> => {
    const { data } = await api.get<Team[]>('/profiles/teams');
    return data;
}

export const updateMyTeam = async (teamId: number): Promise<void> => {
    await api.patch('/profiles/me/team', { team_id: teamId });
}
