from __future__ import annotations

from fastapi import APIRouter

from app.schemas import ChatRequest, ChatResponse, Citation
from app.services.qa import answer_question

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    result = answer_question(payload.document_id, payload.question)
    return ChatResponse(
        answer=result["answer"],
        citations=[Citation(**citation) for citation in result["citations"]],
    )
