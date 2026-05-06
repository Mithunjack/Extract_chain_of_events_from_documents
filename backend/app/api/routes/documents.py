from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.schemas import DocumentSummary, EntitySummary, UploadResponse
from app.services.analysis_pipeline import analyze_document
from app.services.chunking import chunk_pages
from app.services.pdf_parser import extract_pages
from app.services.storage import (
    create_document,
    list_documents,
    list_entities,
    save_chunks,
    update_document,
)

router = APIRouter(prefix="/documents", tags=["documents"])


def _validate_file(file: UploadFile) -> None:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF uploads are supported.",
        )


@router.get("", response_model=list[DocumentSummary])
def get_documents() -> list[DocumentSummary]:
    return [DocumentSummary(**item) for item in list_documents()]


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    _validate_file(file)
    target_path = settings.uploads_dir / file.filename
    payload = await file.read()
    size_mb = len(payload) / (1024 * 1024)
    if size_mb > settings.max_upload_size_mb:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded file is too large for this local demo.",
        )

    target_path.write_bytes(payload)
    document = create_document(file.filename, str(target_path), "uploaded")

    try:
        pages = extract_pages(Path(target_path))
        chunks = chunk_pages(document_id=str(document["id"]), pages=pages)
        save_chunks(str(document["id"]), chunks)
        update_document(
            str(document["id"]),
            status="indexed",
            page_count=len(pages),
            summary=f"Indexed {len(chunks)} narrative chunks from {len(pages)} pages.",
        )
        analyze_document(str(document["id"]))
    except Exception as exc:  # pragma: no cover - defensive path
        document = update_document(str(document["id"]), status="failed", error_message=str(exc))
        raise HTTPException(status_code=500, detail="Document analysis failed.") from exc

    return UploadResponse(document=DocumentSummary(**update_document(str(document["id"]))))


@router.get("/{document_id}/entities", response_model=list[EntitySummary])
def get_document_entities(document_id: str) -> list[EntitySummary]:
    return [EntitySummary(**entity) for entity in list_entities(document_id)]
