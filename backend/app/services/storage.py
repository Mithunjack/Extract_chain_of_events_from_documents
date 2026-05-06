from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from app.db import connection_ctx
from app.models import Chunk, EntityCandidate, EventCandidate


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_document(filename: str, storage_path: str, status: str) -> dict[str, object]:
    document_id = str(uuid.uuid4())
    now = _now()
    with connection_ctx() as connection:
        connection.execute(
            """
            INSERT INTO documents (id, filename, storage_path, status, page_count, summary, created_at, updated_at, error_message)
            VALUES (?, ?, ?, ?, 0, NULL, ?, ?, NULL)
            """,
            (document_id, filename, storage_path, status, now, now),
        )
    return get_document(document_id)


def update_document(document_id: str, **fields: object) -> dict[str, object]:
    if not fields:
        return get_document(document_id)
    updates = []
    values: list[object] = []
    for key, value in fields.items():
        updates.append(f"{key} = ?")
        values.append(value)
    updates.append("updated_at = ?")
    values.append(_now())
    values.append(document_id)
    with connection_ctx() as connection:
        connection.execute(
            f"UPDATE documents SET {', '.join(updates)} WHERE id = ?",
            values,
        )
    return get_document(document_id)


def get_document(document_id: str) -> dict[str, object]:
    with connection_ctx() as connection:
        row = connection.execute(
            "SELECT * FROM documents WHERE id = ?",
            (document_id,),
        ).fetchone()
    if row is None:
        raise KeyError(document_id)
    return dict(row)


def list_documents() -> list[dict[str, object]]:
    with connection_ctx() as connection:
        rows = connection.execute(
            "SELECT * FROM documents ORDER BY created_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def save_chunks(document_id: str, chunks: list[Chunk]) -> None:
    with connection_ctx() as connection:
        connection.execute("DELETE FROM document_chunks WHERE document_id = ?", (document_id,))
        connection.executemany(
            """
            INSERT INTO document_chunks (id, document_id, chunk_index, page_number, text)
            VALUES (?, ?, ?, ?, ?)
            """,
            [(chunk.id, chunk.document_id, chunk.chunk_index, chunk.page_number, chunk.text) for chunk in chunks],
        )


def list_chunks(document_id: str) -> list[dict[str, object]]:
    with connection_ctx() as connection:
        rows = connection.execute(
            "SELECT * FROM document_chunks WHERE document_id = ? ORDER BY page_number, chunk_index",
            (document_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def save_entities(document_id: str, entities: list[EntityCandidate]) -> list[dict[str, object]]:
    now = _now()
    with connection_ctx() as connection:
        connection.execute("DELETE FROM entities WHERE document_id = ?", (document_id,))
        rows = []
        for entity in entities:
            entity_id = str(uuid.uuid4())
            rows.append(
                {
                    "id": entity_id,
                    "document_id": document_id,
                    "canonical_name": entity.canonical_name,
                    "entity_type": entity.entity_type,
                    "aliases_json": json.dumps(sorted(entity.aliases)),
                    "mention_count": entity.mention_count,
                    "created_at": now,
                }
            )
        connection.executemany(
            """
            INSERT INTO entities (id, document_id, canonical_name, entity_type, aliases_json, mention_count, created_at)
            VALUES (:id, :document_id, :canonical_name, :entity_type, :aliases_json, :mention_count, :created_at)
            """,
            rows,
        )
    return list_entities(document_id)


def list_entities(document_id: str) -> list[dict[str, object]]:
    with connection_ctx() as connection:
        rows = connection.execute(
            "SELECT * FROM entities WHERE document_id = ? ORDER BY mention_count DESC, canonical_name ASC",
            (document_id,),
        ).fetchall()
    items = []
    for row in rows:
        item = dict(row)
        item["aliases"] = json.loads(item.pop("aliases_json"))
        items.append(item)
    return items


def get_entity_by_name(document_id: str, entity_name: str) -> Optional[dict[str, object]]:
    lowered = entity_name.lower()
    for entity in list_entities(document_id):
        aliases = [alias.lower() for alias in entity["aliases"]]
        if entity["canonical_name"].lower() == lowered or lowered in aliases:
            return entity
    return None


def save_events(document_id: str, entity_id: str, events: list[EventCandidate]) -> list[dict[str, object]]:
    now = _now()
    with connection_ctx() as connection:
        connection.execute(
            "DELETE FROM events WHERE document_id = ? AND entity_id = ?",
            (document_id, entity_id),
        )
        connection.executemany(
            """
            INSERT INTO events (
                id, document_id, entity_id, title, description, sequence_index, event_phase,
                source_page, source_text, confidence, validation_status, extraction_method, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    str(uuid.uuid4()),
                    document_id,
                    entity_id,
                    event.title,
                    event.description,
                    event.sequence_index,
                    event.event_phase,
                    event.source_page,
                    event.source_text,
                    event.confidence,
                    "accepted",
                    event.extraction_method,
                    now,
                )
                for event in events
            ],
        )
    return list_events(document_id, entity_id)


def list_events(document_id: str, entity_id: str) -> list[dict[str, object]]:
    with connection_ctx() as connection:
        rows = connection.execute(
            """
            SELECT * FROM events
            WHERE document_id = ? AND entity_id = ?
            ORDER BY sequence_index ASC, source_page ASC
            """,
            (document_id, entity_id),
        ).fetchall()
    return [dict(row) for row in rows]
