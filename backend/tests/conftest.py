from __future__ import annotations

import io
import sys
import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.config import settings
from app.db import init_db
from app.main import app


@pytest.fixture(autouse=True)
def clean_storage() -> None:
    if settings.storage_dir.exists():
        shutil.rmtree(settings.storage_dir)
    init_db()


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def sample_pdf_bytes() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=300, height=300)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()
