from __future__ import annotations

import io

from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.main import app


def _make_pdf_bytes() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=300, height=300)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()


def test_healthcheck_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_document_upload_creates_record(client: TestClient) -> None:
    response = client.post(
        "/api/documents/upload",
        files={"file": ("story.pdf", _make_pdf_bytes(), "application/pdf")},
    )

    assert response.status_code == 201
    document = response.json()["document"]
    assert document["filename"] == "story.pdf"
    assert document["status"] in {"indexed", "analyzed"}
