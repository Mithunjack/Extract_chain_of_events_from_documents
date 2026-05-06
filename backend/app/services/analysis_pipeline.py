from __future__ import annotations

from app.services.entity_extraction import extract_entities
from app.services.storage import (
    get_document,
    list_chunks,
    save_entities,
    save_events,
    update_document,
)
from app.services.timeline_builder import build_timeline


def analyze_document(document_id: str) -> None:
    document = get_document(document_id)
    chunks = list_chunks(document_id)
    chunk_texts = [str(chunk["text"]) for chunk in chunks]
    entities = save_entities(document_id, extract_entities(chunk_texts))

    top_entities = entities[:6]
    for entity in top_entities:
        events = build_timeline(entity["canonical_name"], chunks)
        if events:
            save_events(document_id, entity["id"], events)

    summary = (
        f"{document['filename']} analyzed with {len(chunks)} retrieval chunks and "
        f"{len(top_entities)} highlighted entities."
    )
    update_document(document_id, status="analyzed", summary=summary)
