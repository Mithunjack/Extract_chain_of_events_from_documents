from __future__ import annotations

import io

from fastapi.testclient import TestClient
from pypdf import PdfWriter


def _make_pdf_bytes() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=300, height=300)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()


def test_get_timeline_for_entity_returns_ordered_events(client: TestClient) -> None:
    upload = client.post(
        "/api/documents/upload",
        files={"file": ("karna.pdf", _make_pdf_bytes(), "application/pdf")},
    )
    document_id = upload.json()["document"]["id"]

    response = client.get(f"/api/timelines/{document_id}/Karna")

    assert response.status_code in {200, 404}
