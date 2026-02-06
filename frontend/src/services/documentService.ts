import api from './api';

export interface Document {
    id: string;
    agent_id: string;
    filename: string;
    file_type: string;
    file_size: number;
    chunk_count: number;
    created_at: string;
}

export interface DocumentListResponse {
    documents: Document[];
    total: number;
}

export interface DocumentUploadResponse {
    message: string;
    document: Document;
}

export const documentService = {
    async list(agentId: string): Promise<DocumentListResponse> {
        const response = await api.get<DocumentListResponse>(`/agents/${agentId}/documents`);
        return response.data;
    },

    async upload(agentId: string, file: File): Promise<DocumentUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<DocumentUploadResponse>(
            `/agents/${agentId}/documents`,
            formData
        );
        return response.data;
    },

    async delete(documentId: string): Promise<void> {
        await api.delete(`/documents/${documentId}`);
    },
};
