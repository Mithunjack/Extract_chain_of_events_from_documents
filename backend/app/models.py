from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class PageText:
    page_number: int
    text: str


@dataclass
class Chunk:
    id: str
    document_id: str
    chunk_index: int
    page_number: int
    text: str


@dataclass
class EntityCandidate:
    canonical_name: str
    aliases: set[str] = field(default_factory=set)
    mention_count: int = 0
    entity_type: str = "character"


@dataclass
class EventCandidate:
    title: str
    description: str
    sequence_index: int
    event_phase: str
    source_page: int
    source_text: str
    confidence: float
    extraction_method: str = "heuristic"
