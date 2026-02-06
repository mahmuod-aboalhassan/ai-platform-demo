"""RAG (Retrieval Augmented Generation) Service for Knowledge Base."""

import json
import logging
from io import BytesIO
from typing import List, Optional, Tuple

import numpy as np
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.document import Document, DocumentChunk

logger = logging.getLogger(__name__)

# Embedding model
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

# Chunk settings
MAX_CHUNK_TOKENS = 500
CHUNK_OVERLAP_TOKENS = 50


class RAGService:
    """Service for RAG operations: parsing, embedding, and retrieval."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def parse_document(self, content: bytes, filename: str) -> List[str]:
        """Parse document content into text chunks."""
        file_ext = filename.lower().split(".")[-1]
        
        if file_ext == "pdf":
            text = await self._parse_pdf(content)
        elif file_ext in ("txt", "md", "markdown"):
            text = content.decode("utf-8", errors="ignore")
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        # Split into chunks
        chunks = self._split_into_chunks(text)
        return chunks

    async def _parse_pdf(self, content: bytes) -> str:
        """Extract text from PDF."""
        try:
            from PyPDF2 import PdfReader
            
            pdf_file = BytesIO(content)
            reader = PdfReader(pdf_file)
            
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            return "\n\n".join(text_parts)
        except Exception as e:
            logger.error(f"Failed to parse PDF: {e}")
            raise ValueError(f"Failed to parse PDF: {e}")

    def _split_into_chunks(self, text: str) -> List[str]:
        """Split text into overlapping chunks based on token count."""
        try:
            import tiktoken
            enc = tiktoken.get_encoding("cl100k_base")
        except Exception:
            # Fallback to simple character-based splitting
            return self._simple_split(text)

        tokens = enc.encode(text)
        chunks = []
        
        start = 0
        while start < len(tokens):
            end = min(start + MAX_CHUNK_TOKENS, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text = enc.decode(chunk_tokens)
            
            if chunk_text.strip():
                chunks.append(chunk_text.strip())
            
            # Move start forward, accounting for overlap
            start = end - CHUNK_OVERLAP_TOKENS if end < len(tokens) else end

        return chunks

    def _simple_split(self, text: str, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
        """Simple character-based splitting fallback."""
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk = text[start:end].strip()
            
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap if end < len(text) else end

        return chunks

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks using OpenAI."""
        if not texts:
            return []

        try:
            response = await self.client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=texts,
            )
            
            embeddings = [item.embedding for item in response.data]
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise

    async def store_document(
        self,
        agent_id: str,
        filename: str,
        file_type: str,
        file_size: int,
        chunks: List[str],
        embeddings: List[List[float]],
    ) -> Document:
        """Store document and its chunks in the database."""
        # Create document
        document = Document(
            agent_id=agent_id,
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            chunk_count=len(chunks),
        )
        self.db.add(document)
        await self.db.flush()

        # Create chunks
        for i, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
            chunk = DocumentChunk(
                document_id=document.id,
                content=chunk_text,
                embedding=json.dumps(embedding),
                chunk_index=i,
                token_count=len(chunk_text.split()),  # Approximate
            )
            self.db.add(chunk)

        await self.db.commit()
        await self.db.refresh(document)
        
        return document

    async def search_similar(
        self,
        agent_id: str,
        query: str,
        top_k: int = 5,
    ) -> List[Tuple[str, float]]:
        """Search for similar chunks using cosine similarity."""
        # Generate query embedding
        query_embeddings = await self.generate_embeddings([query])
        if not query_embeddings:
            return []
        
        query_embedding = np.array(query_embeddings[0])

        # Get all chunks for this agent's documents
        stmt = (
            select(DocumentChunk)
            .join(Document)
            .where(Document.agent_id == agent_id)
        )
        result = await self.db.execute(stmt)
        chunks = result.scalars().all()

        if not chunks:
            return []

        # Calculate cosine similarities
        similarities = []
        for chunk in chunks:
            chunk_embedding = np.array(json.loads(chunk.embedding))
            similarity = self._cosine_similarity(query_embedding, chunk_embedding)
            similarities.append((chunk.content, similarity))

        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    async def get_context_for_query(
        self,
        agent_id: str,
        query: str,
        max_context_chars: int = 4000,
        similarity_threshold: float = 0.15,  # Lowered from 0.3 for better recall
    ) -> Optional[str]:
        """Get relevant context from knowledge base for a query."""
        similar_chunks = await self.search_similar(agent_id, query, top_k=5)
        
        if not similar_chunks:
            logger.info(f"No chunks found for agent {agent_id}")
            return None

        # Log similarity scores for debugging
        logger.info(f"Query: '{query[:50]}...' - Top similarities: {[round(s, 3) for _, s in similar_chunks[:3]]}")

        # Filter by similarity threshold and build context
        context_parts = []
        total_chars = 0
        
        for content, similarity in similar_chunks:
            if similarity < similarity_threshold:
                continue
            
            if total_chars + len(content) > max_context_chars:
                break
            
            context_parts.append(content)
            total_chars += len(content)

        if not context_parts:
            logger.info(f"All chunks below threshold ({similarity_threshold})")
            return None

        return "\n\n---\n\n".join(context_parts)

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its chunks."""
        stmt = select(Document).where(Document.id == document_id)
        result = await self.db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            return False
        
        await self.db.delete(document)
        await self.db.commit()
        return True

    async def list_documents(self, agent_id: str) -> List[Document]:
        """List all documents for an agent."""
        stmt = select(Document).where(Document.agent_id == agent_id).order_by(Document.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
