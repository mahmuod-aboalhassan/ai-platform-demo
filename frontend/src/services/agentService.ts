import api from './api';
import type { Agent, AgentCreate, AgentUpdate, AgentListResponse } from '../types';

export const agentService = {
  async list(): Promise<AgentListResponse> {
    const response = await api.get<AgentListResponse>('/agents');
    return response.data;
  },

  async get(id: string): Promise<Agent> {
    const response = await api.get<Agent>(`/agents/${id}`);
    return response.data;
  },

  async create(data: AgentCreate): Promise<Agent> {
    const response = await api.post<Agent>('/agents', data);
    return response.data;
  },

  async update(id: string, data: AgentUpdate): Promise<Agent> {
    const response = await api.put<Agent>(`/agents/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/agents/${id}`);
  },

  async refine(description: string): Promise<{ system_prompt: string }> {
    const response = await api.post<{ system_prompt: string }>('/agents/refine', { description });
    return response.data;
  },
};
