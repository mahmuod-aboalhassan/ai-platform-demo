"""Pydantic schemas for documents (Knowledge Base)."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    """Base document schema."""
    filename: str


class DocumentCreate(DocumentBase):
    """Schema for document upload - file is passed separately."""
    pass


class DocumentResponse(BaseModel):
    """Response schema for a document."""
    id: str
    agent_id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    """Response schema for listing documents."""
    documents: List[DocumentResponse]
    total: int


class DocumentUploadResponse(BaseModel):
    """Response schema for document upload."""
    message: str
    document: DocumentResponse


class DocumentDeleteResponse(BaseModel):
    """Response schema for document deletion."""
    message: str
    document_id: str
