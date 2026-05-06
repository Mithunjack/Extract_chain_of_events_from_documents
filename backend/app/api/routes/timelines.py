from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import EventSummary, TimelineResponse
from app.services.storage import get_entity_by_name, list_events

router = APIRouter(prefix="/timelines", tags=["timelines"])


@router.get("/{document_id}/{entity_name}", response_model=TimelineResponse)
def get_timeline(document_id: str, entity_name: str) -> TimelineResponse:
    entity = get_entity_by_name(document_id, entity_name)
    if entity is None:
        raise HTTPException(status_code=404, detail="Timeline not found for that entity.")
    events = list_events(document_id, entity["id"])
    if not events:
        raise HTTPException(status_code=404, detail="No events found for that entity.")

    overview = (
        f"{entity['canonical_name']} appears across {len(events)} narrative beats "
        f"in this document."
    )
    return TimelineResponse(
        entity=entity["canonical_name"],
        documentId=document_id,
        overview=overview,
        events=[
            EventSummary(
                id=event["id"],
                title=event["title"],
                summary=event["description"],
                sequenceIndex=event["sequence_index"],
                eventPhase=event["event_phase"],
                sourcePage=event["source_page"],
                confidence=event["confidence"],
            )
            for event in events
        ],
    )
