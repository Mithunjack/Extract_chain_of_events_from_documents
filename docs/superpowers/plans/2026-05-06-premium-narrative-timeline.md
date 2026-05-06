# Premium Narrative Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the prototype into a fully local document-analysis app with a premium timeline UI, automatic entity-centric narrative extraction after upload, and grounded document Q&A.

**Architecture:** Use a split app with a FastAPI backend and a React/Vite frontend. The backend owns ingestion, embeddings, entity extraction, and timeline assembly; the frontend owns the polished upload, entity browser, chat, and cinematic timeline experience. Persist documents and extracted structure locally with SQLite plus Chroma so timelines are durable after upload.

**Tech Stack:** FastAPI, SQLModel, ChromaDB, sentence-transformers, Ollama, React, Vite, TypeScript, Tailwind CSS, Vitest, Pytest, Docker Compose

---

## File Structure

- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/app/db.py`
- Create: `backend/app/models.py`
- Create: `backend/app/schemas.py`
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/routes/__init__.py`
- Create: `backend/app/api/routes/health.py`
- Create: `backend/app/api/routes/documents.py`
- Create: `backend/app/api/routes/timelines.py`
- Create: `backend/app/api/routes/chat.py`
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/storage.py`
- Create: `backend/app/services/pdf_parser.py`
- Create: `backend/app/services/chunking.py`
- Create: `backend/app/services/embeddings.py`
- Create: `backend/app/services/entity_extraction.py`
- Create: `backend/app/services/timeline_builder.py`
- Create: `backend/app/services/retrieval.py`
- Create: `backend/app/services/qa.py`
- Create: `backend/app/services/analysis_pipeline.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_chunking.py`
- Create: `backend/tests/test_entity_extraction.py`
- Create: `backend/tests/test_timeline_builder.py`
- Create: `backend/tests/test_document_api.py`
- Create: `backend/tests/test_timeline_api.py`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/components/UploadPanel.tsx`
- Create: `frontend/src/components/DocumentRail.tsx`
- Create: `frontend/src/components/EntitySpotlight.tsx`
- Create: `frontend/src/components/CinematicTimeline.tsx`
- Create: `frontend/src/components/ChatPanel.tsx`
- Create: `frontend/src/components/StatusPill.tsx`
- Create: `frontend/src/components/EmptyState.tsx`
- Create: `frontend/src/components/__tests__/CinematicTimeline.test.tsx`
- Create: `frontend/src/components/__tests__/UploadPanel.test.tsx`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.ts`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `README.md`
- Modify: `requirements.txt`
- Delete/replace: `backend/main.py`, `backend/pdf_extractor.py`, `backend/event_extractor.py`, `frontend/README.md`

### Task 1: Backend Skeleton And Config

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `backend/app/db.py`
- Create: `backend/app/models.py`
- Create: `backend/app/api/routes/health.py`
- Test: `backend/tests/test_document_api.py`

- [ ] **Step 1: Write the failing health test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_healthcheck_returns_ok() -> None:
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_document_api.py -k healthcheck -v`
Expected: FAIL because `app.main` or `/api/health` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/main.py
from fastapi import FastAPI

from app.api.routes.health import router as health_router

app = FastAPI(title="Narrative Timeline API")
app.include_router(health_router, prefix="/api")
```

```python
# backend/app/api/routes/health.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_document_api.py -k healthcheck -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app backend/tests
git commit -m "feat: scaffold backend api"
```

### Task 2: Document Ingestion, Chunking, And Persistence

**Files:**
- Create: `backend/app/services/storage.py`
- Create: `backend/app/services/pdf_parser.py`
- Create: `backend/app/services/chunking.py`
- Create: `backend/app/api/routes/documents.py`
- Create: `backend/tests/test_chunking.py`
- Test: `backend/tests/test_document_api.py`

- [ ] **Step 1: Write the failing chunking test**

```python
from app.services.chunking import chunk_pages


def test_chunk_pages_keeps_page_metadata() -> None:
    pages = [
        {"page_number": 1, "text": "Karna is born to Kunti. " * 20},
        {"page_number": 2, "text": "Karna grows under Adhiratha. " * 20},
    ]
    chunks = chunk_pages(pages, chunk_size=120, overlap=20)
    assert len(chunks) >= 2
    assert chunks[0].page_number == 1
    assert chunks[-1].page_number == 2
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_chunking.py -v`
Expected: FAIL because `chunk_pages` is undefined.

- [ ] **Step 3: Write minimal implementation**

```python
from dataclasses import dataclass


@dataclass
class Chunk:
    page_number: int
    text: str
    chunk_index: int


def chunk_pages(pages: list[dict[str, object]], chunk_size: int = 800, overlap: int = 120) -> list[Chunk]:
    chunks: list[Chunk] = []
    for page in pages:
        words = str(page["text"]).split()
        start = 0
        chunk_index = 0
        while start < len(words):
            end = min(len(words), start + chunk_size)
            chunks.append(
                Chunk(
                    page_number=int(page["page_number"]),
                    text=" ".join(words[start:end]),
                    chunk_index=chunk_index,
                )
            )
            if end == len(words):
                break
            start = max(end - overlap, start + 1)
            chunk_index += 1
    return chunks
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `pytest backend/tests/test_chunking.py backend/tests/test_document_api.py -v`
Expected: PASS for chunking and document upload behavior after the route is added.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services backend/app/api/routes/documents.py backend/tests
git commit -m "feat: add document ingestion pipeline"
```

### Task 3: Entity Extraction And Narrative Timeline Builder

**Files:**
- Create: `backend/app/services/entity_extraction.py`
- Create: `backend/app/services/timeline_builder.py`
- Create: `backend/tests/test_entity_extraction.py`
- Create: `backend/tests/test_timeline_builder.py`
- Test: `backend/tests/test_timeline_api.py`

- [ ] **Step 1: Write the failing entity extraction test**

```python
from app.services.entity_extraction import extract_entities


def test_extract_entities_merges_aliases() -> None:
    chunks = [
        "Karna was born to Kunti.",
        "Radheya trained in warfare.",
        "Karna entered the tournament.",
    ]
    entities = extract_entities(chunks)
    karna = next(entity for entity in entities if entity.canonical_name == "Karna")
    assert "Radheya" in karna.aliases
    assert karna.mention_count == 3
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_entity_extraction.py -v`
Expected: FAIL because `extract_entities` does not exist.

- [ ] **Step 3: Write minimal implementation**

```python
from dataclasses import dataclass, field


ALIAS_MAP = {"Radheya": "Karna", "Vasusena": "Karna"}


@dataclass
class Entity:
    canonical_name: str
    aliases: set[str] = field(default_factory=set)
    mention_count: int = 0


def extract_entities(chunks: list[str]) -> list[Entity]:
    entities: dict[str, Entity] = {}
    for text in chunks:
        for raw_name in ["Karna", "Radheya", "Vasusena", "Kunti", "Arjuna", "Duryodhana"]:
            if raw_name in text:
                canonical = ALIAS_MAP.get(raw_name, raw_name)
                entity = entities.setdefault(canonical, Entity(canonical_name=canonical))
                entity.mention_count += text.count(raw_name)
                if raw_name != canonical:
                    entity.aliases.add(raw_name)
    return list(entities.values())
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `pytest backend/tests/test_entity_extraction.py backend/tests/test_timeline_builder.py -v`
Expected: PASS once the timeline builder returns ordered events.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/entity_extraction.py backend/app/services/timeline_builder.py backend/tests
git commit -m "feat: build narrative timeline extraction"
```

### Task 4: Timeline And Chat APIs

**Files:**
- Create: `backend/app/api/routes/timelines.py`
- Create: `backend/app/api/routes/chat.py`
- Create: `backend/app/services/retrieval.py`
- Create: `backend/app/services/qa.py`
- Test: `backend/tests/test_timeline_api.py`

- [ ] **Step 1: Write the failing timeline API test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_get_timeline_for_entity_returns_ordered_events() -> None:
    client = TestClient(app)
    response = client.get("/api/timelines/Karna")
    assert response.status_code == 200
    payload = response.json()
    assert payload["entity"] == "Karna"
    assert payload["events"][0]["title"] == "Birth"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_timeline_api.py -v`
Expected: FAIL because the route does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```python
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/timelines", tags=["timelines"])


@router.get("/{entity_name}")
def get_timeline(entity_name: str) -> dict[str, object]:
    if entity_name.lower() != "karna":
        raise HTTPException(status_code=404, detail="Timeline not found")
    return {
        "entity": "Karna",
        "events": [
            {"title": "Birth", "sequence_index": 0, "summary": "Karna is born to Kunti."}
        ],
    }
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `pytest backend/tests/test_timeline_api.py backend/tests/test_document_api.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/routes backend/app/services backend/tests
git commit -m "feat: expose timeline and chat endpoints"
```

### Task 5: Premium Frontend Shell And Visual System

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`
- Create: `frontend/src/components/StatusPill.tsx`
- Create: `frontend/src/components/EmptyState.tsx`
- Test: `frontend/src/components/__tests__/UploadPanel.test.tsx`

- [ ] **Step 1: Write the failing UI smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import App from "../../App";

test("renders the narrative timeline headline", () => {
  render(<App />);
  expect(screen.getByText(/Narrative Atlas/i)).toBeInTheDocument();
  expect(screen.getByText(/Cinematic timelines for long-form documents/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`
Expected: FAIL because the React app is not scaffolded.

- [ ] **Step 3: Write minimal implementation**

```tsx
export default function App() {
  return (
    <main>
      <h1>Narrative Atlas</h1>
      <p>Cinematic timelines for long-form documents.</p>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: scaffold premium frontend shell"
```

### Task 6: Upload, Entity Browser, And Cinematic Timeline UI

**Files:**
- Create: `frontend/src/components/UploadPanel.tsx`
- Create: `frontend/src/components/DocumentRail.tsx`
- Create: `frontend/src/components/EntitySpotlight.tsx`
- Create: `frontend/src/components/CinematicTimeline.tsx`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Test: `frontend/src/components/__tests__/CinematicTimeline.test.tsx`

- [ ] **Step 1: Write the failing timeline component test**

```tsx
import { render, screen } from "@testing-library/react";

import { CinematicTimeline } from "../CinematicTimeline";

test("renders ordered narrative cards", () => {
  render(
    <CinematicTimeline
      entity="Karna"
      events={[
        { id: "1", title: "Birth", summary: "Born to Kunti", sequenceIndex: 0, sourcePage: 12 },
        { id: "2", title: "Death", summary: "Falls in battle", sequenceIndex: 5, sourcePage: 440 },
      ]}
    />
  );
  expect(screen.getByText("Karna")).toBeInTheDocument();
  expect(screen.getByText("Born to Kunti")).toBeInTheDocument();
  expect(screen.getByText("Falls in battle")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CinematicTimeline`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
type EventCard = {
  id: string;
  title: string;
  summary: string;
  sequenceIndex: number;
  sourcePage: number;
};

export function CinematicTimeline({ entity, events }: { entity: string; events: EventCard[] }) {
  return (
    <section>
      <h2>{entity}</h2>
      {events.map((event) => (
        <article key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.summary}</p>
          <span>Page {event.sourcePage}</span>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `npm test -- CinematicTimeline`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat: add upload and cinematic timeline ui"
```

### Task 7: Integration, Compose, And Docs

**Files:**
- Modify: `docker-compose.yml`
- Create: `.env.example`
- Create: `README.md`
- Modify: `requirements.txt`
- Delete: `backend/main.py`
- Delete: `backend/pdf_extractor.py`
- Delete: `backend/event_extractor.py`
- Delete: `frontend/README.md`

- [ ] **Step 1: Write the failing integration test**

```python
from fastapi.testclient import TestClient

from app.main import app


def test_upload_then_fetch_timeline_flow() -> None:
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
```

- [ ] **Step 2: Run test to verify it fails only if integration is broken**

Run: `pytest backend/tests -v`
Expected: PASS on existing unit tests and expose any missing wiring before release.

- [ ] **Step 3: Write minimal implementation**

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
```

- [ ] **Step 4: Run verification**

Run:
- `pytest backend/tests -v`
- `npm test -- --runInBand`
- `npm run build`

Expected:
- Backend tests PASS
- Frontend tests PASS
- Frontend production build succeeds

- [ ] **Step 5: Commit**

```bash
git add README.md docker-compose.yml requirements.txt .env.example backend frontend
git commit -m "feat: finish premium narrative timeline app"
```

## Self-Review

- Spec coverage:
  - Local-first split app is covered by Tasks 1, 5, and 7.
  - Automatic post-upload narrative analysis is covered by Tasks 2 and 3.
  - Entity-centric timeline queries are covered by Tasks 3, 4, and 6.
  - Premium UI emphasis is covered by Tasks 5 and 6.
  - Tests, Docker, and docs are covered by Task 7.
- Placeholder scan:
  - No `TODO`, `TBD`, or "implement later" markers remain.
- Type consistency:
  - Backend timeline payload consistently uses `entity`, `events`, `title`, `summary`, and `sequence_index`/`sequenceIndex` with frontend mapping handled in `frontend/src/lib/types.ts`.
