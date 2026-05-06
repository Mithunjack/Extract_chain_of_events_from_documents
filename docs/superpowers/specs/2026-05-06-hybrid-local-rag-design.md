# Hybrid Local RAG Design

## Goal

Modernize this repository into a local-first document intelligence application with two primary capabilities:

1. Retrieval-augmented question answering over uploaded PDF documents
2. Structured event extraction that turns document content into a timeline view

The system must run fully locally, provide a web interface, and avoid paid API dependencies.

## Product Scope

### In Scope

- Upload one or more PDF documents through a browser UI
- Extract page-aware text from uploaded PDFs
- Chunk and embed document content locally
- Store metadata, vectors, and extracted events locally
- Ask grounded questions over selected documents and receive cited answers
- Extract structured events from documents and render them in a timeline-friendly format
- Run locally through Docker Compose with persistent storage

### Out of Scope

- OCR for scanned-image PDFs in the first pass
- Multi-user authentication and authorization
- Cloud deployment automation
- Fine-tuning or training custom models
- Complex workflow orchestration infrastructure

## Recommended Architecture

Use a modern split application:

- `backend/`: FastAPI application exposing ingestion, retrieval, Q&A, and event extraction APIs
- `frontend/`: React + Vite web app for upload, chat, document browsing, and timeline visualization
- `storage/`: local persisted data for uploaded files, SQLite database, and vector index
- `docker-compose.yml`: local startup for backend, frontend, Ollama, and mounted persistent volumes

### Technology Choices

- API framework: FastAPI
- Frontend: React + Vite + TypeScript
- Metadata database: SQLite
- ORM layer: SQLModel or SQLAlchemy
- PDF parsing: `pypdf` or `pymupdf`
- Embeddings: `sentence-transformers`
- Vector store: Chroma with persistent local storage
- Local LLM runtime: Ollama
- Validation: Pydantic v2
- Testing: Pytest for backend, Vitest for frontend where useful

## System Components

### Backend

#### Document Ingestion Service

Responsibilities:

- Validate uploaded files
- Persist original files
- Extract page-aware text
- Chunk text into retrieval units
- Compute embeddings locally
- Write document metadata and chunks to storage
- Write vectors to the local vector index

#### Retrieval Service

Responsibilities:

- Accept a question and optional document filters
- Run semantic retrieval against indexed chunks
- Return relevant context with document and page references

#### Q&A Service

Responsibilities:

- Build a grounded prompt from retrieved context
- Ask the local LLM to answer only from retrieved evidence
- Return answer text plus citations

#### Event Extraction Service

Responsibilities:

- Select event-relevant chunks from indexed content
- Prompt the local LLM for strict JSON output
- Validate output against a typed event schema
- Normalize dates, times, and source references
- Persist accepted events for later review and display

#### Repository Layer

Responsibilities:

- Encapsulate SQLite access for documents, chunks, events, and chat state
- Keep service logic separate from persistence concerns

### Frontend

#### Upload View

- Drag-and-drop or file-picker PDF upload
- Per-document processing state
- Clear failure messaging

#### Documents View

- List uploaded files
- Show ingestion and extraction status
- Allow document selection for chat scope

#### Chat View

- Ask grounded questions over uploaded documents
- Show cited answers with document and page references
- Keep a light session history

#### Timeline View

- Display extracted events in chronological order
- Show date, time, title, source document, and validation status

## Data Model

### documents

- `id`
- `filename`
- `storage_path`
- `status`
- `page_count`
- `created_at`
- `updated_at`
- `error_message`

### document_chunks

- `id`
- `document_id`
- `chunk_index`
- `page_number`
- `text`
- `token_count`
- `embedding_id`

### events

- `id`
- `document_id`
- `title`
- `description`
- `start_date`
- `start_time`
- `end_date`
- `end_time`
- `source_page`
- `source_text`
- `confidence`
- `validation_status`
- `created_at`

### chat_sessions

- `id`
- `created_at`

### chat_messages

- `id`
- `session_id`
- `role`
- `content`
- `citations_json`
- `created_at`

## Data Flow

### Ingestion

1. User uploads one or more PDFs from the frontend
2. Backend validates type and size
3. Backend stores the original file locally
4. Backend extracts page-aware text
5. Backend chunks text and computes local embeddings
6. Backend stores metadata in SQLite and vectors in Chroma
7. Backend marks document status as indexed or failed

### Question Answering

1. Frontend sends a question and selected document scope
2. Backend retrieves top relevant chunks
3. Backend builds a grounded prompt using only retrieved context
4. Ollama generates an answer constrained to that context
5. Backend returns answer text and citations

### Event Extraction

1. Backend selects likely event-bearing chunks from indexed documents
2. Backend prompts Ollama for strict structured JSON
3. Backend validates the returned payload
4. Backend normalizes fields like date and time
5. Backend stores valid events and marks invalid ones as rejected or failed
6. Frontend renders the timeline from persisted event data

## Runtime Behavior

### Processing Model

- The UI should treat ingestion as asynchronous
- The initial implementation may use lightweight background tasks in FastAPI
- The architecture should leave room for a job queue later if needed

### Storage Model

- Uploaded documents are stored on disk in a dedicated local directory
- Metadata and application state live in SQLite
- Embeddings and chunk vectors live in a persistent Chroma directory

### Model Usage

- Embeddings are generated with a local sentence-transformer model
- Answer generation and event extraction run through Ollama
- Event extraction uses a stricter structured-output prompt than chat answering

## Error Handling

- Reject unsupported file types cleanly
- Reject oversized uploads with clear messages
- Track document lifecycle with explicit statuses such as `uploaded`, `parsed`, `indexed`, and `failed`
- Allow partial success: indexing can succeed even if event extraction fails
- Validate all structured LLM output before persistence
- Return stable API error shapes for frontend rendering

## Testing Strategy

### Backend Tests

- Unit tests for chunking behavior
- Unit tests for event schema validation and normalization
- Unit tests for retrieval filters and citation formatting
- Integration tests for upload -> index -> query
- Integration tests for upload -> extract events

### Frontend Tests

- Component tests for upload status handling
- Component tests for chat answer rendering with citations
- Component tests for timeline rendering

### Fixtures And Smoke Tests

- Keep a small set of sample PDFs for regression testing
- Add a local smoke test for Docker Compose startup
- Verify backend health, Ollama connectivity, and a minimal ingestion path

## Repository Restructure

The current repository should be simplified and reorganized to match the target architecture:

- Replace the current minimal backend scripts with a package-structured FastAPI app
- Replace placeholder frontend content with a real React application
- Remove unrelated or stale dependencies
- Rewrite the README to reflect actual setup and usage
- Add environment configuration examples
- Add test scaffolding and fixture documents

## Migration Priorities

1. Stabilize backend package structure and configuration
2. Implement ingestion, chunking, and local vector indexing
3. Implement retrieval-backed Q&A with citations
4. Implement structured event extraction and normalization
5. Build the frontend upload, chat, and timeline views
6. Add tests, Docker Compose polish, and documentation cleanup

## Success Criteria

- A new user can run the project locally with documented setup steps
- PDFs can be uploaded and indexed without manual intervention
- Questions return grounded answers with document/page citations
- Events are extracted into a structured timeline view
- Core flows are covered by automated tests
- The codebase is modular, maintainable, and clearly more modern than the original prototype
