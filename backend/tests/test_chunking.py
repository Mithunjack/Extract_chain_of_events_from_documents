from app.models import PageText
from app.services.chunking import chunk_pages


def test_chunk_pages_keeps_page_metadata() -> None:
    pages = [
        PageText(page_number=1, text="Karna is born to Kunti. " * 40),
        PageText(page_number=2, text="Karna trains and prepares for war. " * 40),
    ]

    chunks = chunk_pages("doc-1", pages, chunk_size=24, overlap=4)

    assert len(chunks) >= 2
    assert chunks[0].page_number == 1
    assert chunks[-1].page_number == 2
    assert chunks[0].document_id == "doc-1"
