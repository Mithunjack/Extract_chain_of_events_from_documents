from __future__ import annotations

from app.services.embeddings import cosine_similarity, embed_text
from app.services.storage import list_chunks


def retrieve_relevant_chunks(document_id: str, question: str, limit: int = 4) -> list[dict[str, object]]:
    question_embedding = embed_text(question)
    ranked = []
    for chunk in list_chunks(document_id):
        score = cosine_similarity(question_embedding, embed_text(str(chunk["text"])))
        ranked.append((score, chunk))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return [chunk for score, chunk in ranked[:limit] if score > 0]
