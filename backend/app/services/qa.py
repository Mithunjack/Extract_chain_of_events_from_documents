from __future__ import annotations

from app.services.retrieval import retrieve_relevant_chunks


def answer_question(document_id: str, question: str) -> dict[str, object]:
    chunks = retrieve_relevant_chunks(document_id, question)
    if not chunks:
        return {
            "answer": "I could not find grounded evidence for that question in the uploaded document yet.",
            "citations": [],
        }

    evidence = chunks[0]
    answer = (
        "Here is the best grounded answer from the document: "
        f"{str(evidence['text'])[:320]}"
    )
    citations = [
        {"page": int(chunk["page_number"]), "quote": str(chunk["text"])[:180]}
        for chunk in chunks
    ]
    return {"answer": answer, "citations": citations}
