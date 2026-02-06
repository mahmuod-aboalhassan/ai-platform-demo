import api from './api';
import type { Session, SessionCreate, SessionDetail, SessionListResponse } from '../types';

export const sessionService = {
  async list(agentId: string): Promise<SessionListResponse> {
    const response = await api.get<SessionListResponse>(`/agents/${agentId}/sessions`);
    return response.data;
  },

  async get(id: string): Promise<SessionDetail> {
    const response = await api.get<SessionDetail>(`/sessions/${id}`);
    return response.data;
  },

  async create(agentId: string, data: SessionCreate = {}): Promise<Session> {
    const response = await api.post<Session>(`/agents/${agentId}/sessions`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },
};
