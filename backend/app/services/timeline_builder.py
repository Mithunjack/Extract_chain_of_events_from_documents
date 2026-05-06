from __future__ import annotations

from app.models import EventCandidate


EVENT_RULES = [
    ("born", "Birth", "origin"),
    ("raised", "Childhood", "upbringing"),
    ("trained", "Training", "development"),
    ("tournament", "Recognition", "rise"),
    ("cursed", "Curse", "conflict"),
    ("killed", "Death", "end"),
    ("death", "Death", "end"),
    ("died", "Death", "end"),
    ("war", "War", "conflict"),
    ("battle", "Battle", "conflict"),
]


def build_timeline(entity_name: str, chunks: list[dict[str, object]]) -> list[EventCandidate]:
    events: list[EventCandidate] = []
    ordered_chunks = [chunk for chunk in chunks if entity_name.lower() in str(chunk["text"]).lower()]
    for sequence_index, chunk in enumerate(ordered_chunks):
        lowered = str(chunk["text"]).lower()
        for keyword, title, phase in EVENT_RULES:
            if keyword in lowered:
                events.append(
                    EventCandidate(
                        title=title,
                        description=_summarize_chunk(entity_name, str(chunk["text"]), title),
                        sequence_index=sequence_index,
                        event_phase=phase,
                        source_page=int(chunk["page_number"]),
                        source_text=str(chunk["text"]),
                        confidence=0.72,
                        extraction_method="keyword-sequence",
                    )
                )
                break

    if not events and ordered_chunks:
        for sequence_index, chunk in enumerate(ordered_chunks[:6]):
            events.append(
                EventCandidate(
                    title=f"Story Beat {sequence_index + 1}",
                    description=_summarize_chunk(entity_name, str(chunk["text"]), "Story Beat"),
                    sequence_index=sequence_index,
                    event_phase="narrative",
                    source_page=int(chunk["page_number"]),
                    source_text=str(chunk["text"]),
                    confidence=0.55,
                    extraction_method="fallback-sequence",
                )
            )
    return _dedupe_events(events)


def _summarize_chunk(entity_name: str, chunk_text: str, title: str) -> str:
    sentence = chunk_text[:220].strip()
    if sentence.endswith("."):
        return sentence
    return f"{entity_name}: {title}. {sentence}"


def _dedupe_events(events: list[EventCandidate]) -> list[EventCandidate]:
    seen: set[tuple[str, int]] = set()
    deduped: list[EventCandidate] = []
    for event in events:
        key = (event.title, event.source_page)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(event)
    return deduped
