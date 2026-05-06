from __future__ import annotations

import uuid

from app.models import Chunk, PageText


def chunk_pages(
    document_id: str,
    pages: list[PageText],
    chunk_size: int = 180,
    overlap: int = 35,
) -> list[Chunk]:
    chunks: list[Chunk] = []
    for page in pages:
        words = page.text.split()
        start = 0
        chunk_index = 0
        while start < len(words):
            end = min(len(words), start + chunk_size)
            text = " ".join(words[start:end]).strip()
            if text:
                chunks.append(
                    Chunk(
                        id=str(uuid.uuid4()),
                        document_id=document_id,
                        chunk_index=chunk_index,
                        page_number=page.page_number,
                        text=text,
                    )
                )
            if end == len(words):
                break
            start = max(end - overlap, start + 1)
            chunk_index += 1
    return chunks
