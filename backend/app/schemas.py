from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class DocumentSummary(BaseModel):
    id: str
    filename: str
    status: str
    page_count: int
    summary: Optional[str] = None
    created_at: str
    updated_at: str


class UploadResponse(BaseModel):
    document: DocumentSummary


class EntitySummary(BaseModel):
    id: str
    canonical_name: str
    entity_type: str
    aliases: list[str]
    mention_count: int


class EventSummary(BaseModel):
    id: str
    title: str
    summary: str
    sequence_index: int = Field(alias="sequenceIndex")
    event_phase: str = Field(alias="eventPhase")
    source_page: int = Field(alias="sourcePage")
    confidence: float

    model_config = {"populate_by_name": True}


class TimelineResponse(BaseModel):
    entity: str
    document_id: str = Field(alias="documentId")
    overview: str
    events: list[EventSummary]

    model_config = {"populate_by_name": True}


class ChatRequest(BaseModel):
    question: str
    document_id: str = Field(alias="documentId")

    model_config = {"populate_by_name": True}


class Citation(BaseModel):
    page: int
    quote: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]


class HealthResponse(BaseModel):
    status: Literal["ok"]
