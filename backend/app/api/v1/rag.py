from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel

from app.api.deps import get_current_active_employee
from app.models.auth import User
from app.ml.rag_engine import (
    OFFICIAL_POLICY_CORPUS,
    PolicyDocumentCitation,
    PolicyRAGService,
    RAGAnswerResponse,
    RAGQueryRequest,
)

router = APIRouter(prefix="/rag", tags=["Policy Document AI Assistant (RAG)"])


@router.post("/query", response_model=RAGAnswerResponse)
async def query_policy_documents(
    payload: RAGQueryRequest,
    current_user: User = Depends(get_current_active_employee),
):
    """Retrieve grounded answers and official clause citations from catalogued insurer policy wordings.

    Enforces strict guardrails: Never synthesizes or hallucinates unverified clauses.
    """
    return PolicyRAGService.answer_policy_query(payload)


@router.get("/corpus")
async def list_indexed_corpus(
    insurer: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_employee),
):
    """List catalogued policy documents, versions, UINs, and indexed clauses."""
    chunks = OFFICIAL_POLICY_CORPUS
    if insurer:
        chunks = [c for c in chunks if insurer.lower() in c.insurer_name.lower()]

    return [
        {
            "chunk_id": c.chunk_id,
            "document_name": c.document_name,
            "insurer_name": c.insurer_name,
            "product_name": c.product_name,
            "product_uin": c.product_uin,
            "product_version": c.product_version,
            "document_type": c.document_type,
            "page_number": c.page_number,
            "clause_reference": c.clause_reference,
            "effective_date": c.effective_date,
            "snippet": c.text[:120] + "...",
        }
        for c in chunks
    ]
