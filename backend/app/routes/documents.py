"""Documents router for Knowledge Base API."""

import logging
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.models.agent import Agent
from app.models.document import Document
from app.schemas.document import (
    DocumentDeleteResponse,
    DocumentListResponse,
    DocumentResponse,
    DocumentUploadResponse,
)
from app.services.rag_service import RAGService

logger = logging.getLogger(__name__)

router = APIRouter()

# Allowed file types and max size
ALLOWED_EXTENSIONS = {"pdf", "txt", "md", "markdown"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return filename.lower().split(".")[-1] if "." in filename else ""


@router.post("/agents/{agent_id}/documents", response_model=DocumentUploadResponse)
async def upload_document(
    agent_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> DocumentUploadResponse:
    """Upload a document to an agent's knowledge base."""
    # Verify agent exists
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    # Validate file type
    file_ext = get_file_extension(file.filename or "unknown")
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file_ext}. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty",
        )

    try:
        rag_service = RAGService(db)

        # Parse document into chunks
        chunks = await rag_service.parse_document(content, file.filename or "document")
        
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract any text from the document",
            )

        logger.info(f"Parsed document into {len(chunks)} chunks")

        # Generate embeddings
        embeddings = await rag_service.generate_embeddings(chunks)
        
        logger.info(f"Generated {len(embeddings)} embeddings")

        # Store document and chunks
        document = await rag_service.store_document(
            agent_id=agent_id,
            filename=file.filename or "document",
            file_type=file_ext,
            file_size=len(content),
            chunks=chunks,
            embeddings=embeddings,
        )

        logger.info(f"Stored document {document.id} with {len(chunks)} chunks")

        return DocumentUploadResponse(
            message="Document uploaded and processed successfully",
            document=DocumentResponse.model_validate(document),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.exception(f"Failed to process document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}",
        )


@router.get("/agents/{agent_id}/documents", response_model=DocumentListResponse)
async def list_documents(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
) -> DocumentListResponse:
    """List all documents for an agent."""
    # Verify agent exists
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    rag_service = RAGService(db)
    documents = await rag_service.list_documents(agent_id)

    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(doc) for doc in documents],
        total=len(documents),
    )


@router.delete("/documents/{document_id}", response_model=DocumentDeleteResponse)
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
) -> DocumentDeleteResponse:
    """Delete a document from the knowledge base."""
    rag_service = RAGService(db)
    deleted = await rag_service.delete_document(document_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    return DocumentDeleteResponse(
        message="Document deleted successfully",
        document_id=document_id,
    )
