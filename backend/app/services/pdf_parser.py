from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader

from app.models import PageText


def extract_pages(pdf_path: Path) -> list[PageText]:
    reader = PdfReader(str(pdf_path))
    pages: list[PageText] = []
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        clean_text = " ".join(text.split())
        if clean_text:
            pages.append(PageText(page_number=index, text=clean_text))
    return pages
