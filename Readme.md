# Narrative Atlas

Narrative Atlas is a local-first document analysis app for turning long-form PDFs into premium character timelines and grounded question answering. Upload a novel, let the backend extract entities and story beats automatically, then explore a cinematic timeline for characters such as Karna from birth to death.

## What Changed

- Replaced the original script-based prototype with a package-structured FastAPI backend
- Added a modern React + Vite frontend focused on premium timeline visualization
- Reframed extraction from generic "events" into entity-centric narrative chains
- Simplified dependencies and documented local development clearly

## Architecture

- `backend/app`: FastAPI routes, services, storage, and narrative analysis pipeline
- `backend/tests`: backend unit and API tests
- `frontend/src`: React app, visual components, tests, and API client
- `storage/`: local runtime data for uploads and SQLite persistence
- `docs/superpowers/specs`: approved design specs
- `docs/superpowers/plans`: implementation plan used for the rebuild

## Local Development

## One Command

From the repo root, run:

```bash
./run.sh
```

What it does:

- Creates `.env` from `.env.example` if needed
- Uses `docker compose up --build` automatically when Docker is available
- Falls back to local startup when both `python3` and `npm` are installed

You can also force a mode:

```bash
./run.sh docker
./run.sh local
```

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Create or edit `.env` at the repo root to control local models and API keys:

```env
NARRATIVE_ATLAS_LLM_PROVIDER=ollama
NARRATIVE_ATLAS_OPENAI_API_KEY=your_openai_key_here
NARRATIVE_ATLAS_OPENAI_MODEL=gpt-4.1-mini
```

The app still defaults to Ollama, but the OpenAI key is now available in config whenever you want to wire API-backed generation later.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Full Stack With Docker

```bash
docker compose up --build
```

This starts:

- Backend at `http://localhost:8000`
- Frontend at `http://localhost:5173`
- Ollama at `http://localhost:11434`

## Core User Flow

1. Upload a PDF in the web interface.
2. The backend stores the file, extracts text, chunks content, and runs local narrative analysis.
3. Detected entities become browsable in the UI.
4. Selecting an entity opens an ordered timeline with story beats and evidence.
5. Chat stays grounded in the document and returns citations.

## Current Narrative Pipeline

The first implementation uses page-aware parsing plus heuristic entity and event extraction so the repo is locally runnable without depending on paid APIs. The service boundaries are designed so Ollama-backed structured extraction and stronger local embedding models can replace the current heuristics cleanly.

## Tests

```bash
pytest backend/tests -q
cd frontend && npm test
```

## Next Up

- Swap heuristic extraction for stronger Ollama-guided structured extraction
- Add richer alias resolution and chapter-aware event ordering
- Support larger books with background jobs and progressive UI updates
