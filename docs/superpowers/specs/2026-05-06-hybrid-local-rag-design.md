# Hybrid Local RAG Design

## Goal

Modernize this repository into a local-first document intelligence application with two primary capabilities:

1. Retrieval-augmented question answering over uploaded PDF documents
2. Automatic entity-centric narrative timeline extraction that turns long-form documents into chain-of-events views

The system must run fully locally, provide a web interface, and avoid paid API dependencies.

## Product Scope

### In Scope

- Upload one or more PDF documents through a browser UI
- Extract page-aware text from uploaded PDFs
- Chunk and embed document content locally
- Store metadata, vectors, and extracted events locally
- Ask grounded questions over selected documents and receive cited answers
- Automatically start post-upload narrative analysis
- Extract entity-centric story events from documents and render them in a timeline-friendly format
- Let a user ask for a character or entity timeline such as "explain Karna's timeline in the whole novel"
- Run locally through Docker Compose with persistent storage

### Out of Scope

- OCR for scanned-image PDFs in the first pass
- Multi-user authentication and authorization
- Cloud deployment automation
- Fine-tuning or training custom models
- Complex workflow orchestration infrastructure
- Fully general knowledge graph construction beyond the document's narrative needs

## Recommended Architecture

Use a modern split application:

- `backend/`: FastAPI application exposing ingestion, retrieval, entity extraction, timeline generation, and Q&A APIs
- `frontend/`: React + Vite web app for upload, document browsing, entity search, and timeline visualization
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

- Select narrative-relevant chunks from indexed content
- Extract candidate story events in structured form
- Associate candidate events with one or more entities
- Normalize source references and event ordering metadata
- Persist accepted events for later review and display

#### Entity Resolution Service

Responsibilities:

- Extract candidate named entities such as characters, places, and groups
- Merge aliases and variant mentions for the same entity
- Link pronoun-heavy or partial mentions back to likely entities when confidence is high
- Persist canonical entity records for downstream timeline generation

#### Narrative Timeline Service

Responsibilities:

- Group events by entity
- Infer likely story sequence when exact dates are absent
- Build a chain-of-events timeline from birth to death or first mention to final state
- Return timeline entries with supporting passages and confidence metadata

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
- Show ingestion and analysis status
- Allow document selection for chat scope or entity browsing

#### Chat View

- Ask grounded questions over uploaded documents
- Show cited answers with document and page references
- Keep a light session history

#### Timeline View

- Display extracted narrative events in inferred story order
- Show entity, event title, event summary, source document, source passage, and confidence

#### Entity View

- List detected entities after analysis completes
- Show aliases, mention counts, and analysis readiness
- Let the user open a character-centric timeline directly

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

### entities

- `id`
- `document_id`
- `canonical_name`
- `entity_type`
- `aliases_json`
- `mention_count`
- `created_at`

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
- `entity_id`
- `title`
- `description`
- `sequence_index`
- `event_phase`
- `source_page`
- `source_text`
- `confidence`
- `validation_status`
- `extraction_method`
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
8. Backend automatically starts post-upload narrative analysis

### Narrative Analysis

1. Backend scans indexed content to detect candidate entities
2. Backend merges aliases and creates canonical entity records
3. Backend extracts candidate story events from chunks or chapter windows
4. Backend links each event to one or more entities
5. Backend orders events using local sequence signals such as chapter position, cue phrases, and model inference
6. Backend stores entity records and ordered event chains for timeline rendering

### Question Answering

1. Frontend sends a question and selected document scope
2. Backend retrieves top relevant chunks
3. Backend builds a grounded prompt using only retrieved context
4. Ollama generates an answer constrained to that context
5. Backend returns answer text and citations

### Timeline Query

1. User opens an entity timeline or asks a query like "explain Karna's timeline in the whole novel"
2. Backend resolves the requested entity against canonical entity records
3. Backend loads stored event chains and supporting passages for that entity
4. Backend optionally uses the local LLM to produce a concise narrative overview grounded in stored events
5. Frontend renders the ordered chain of events with expandable evidence

## Runtime Behavior

### Processing Model

- The UI should treat ingestion as asynchronous
- The initial implementation may use lightweight background tasks in FastAPI
- The architecture should leave room for a job queue later if needed
- Narrative analysis should begin automatically after a document is indexed

### Storage Model

- Uploaded documents are stored on disk in a dedicated local directory
- Metadata and application state live in SQLite
- Embeddings and chunk vectors live in a persistent Chroma directory

### Model Usage

- Embeddings are generated with a local sentence-transformer model
- Answer generation and narrative extraction run through Ollama
- Narrative extraction uses stricter structured-output prompts than chat answering
- Ordering can combine deterministic sequence signals with model-assisted ranking

## Error Handling

- Reject unsupported file types cleanly
- Reject oversized uploads with clear messages
- Track document lifecycle with explicit statuses such as `uploaded`, `parsed`, `indexed`, and `failed`
- Track analysis lifecycle separately so indexing can succeed even if timeline extraction fails
- Validate all structured LLM output before persistence
- Return stable API error shapes for frontend rendering
- Preserve low-confidence entity/event candidates for debugging only when useful, but do not surface them as final timeline facts by default

## Testing Strategy

### Backend Tests

- Unit tests for chunking behavior
- Unit tests for entity alias merging
- Unit tests for event schema validation and normalization
- Unit tests for sequence ordering heuristics
- Unit tests for retrieval filters and citation formatting
- Integration tests for upload -> index -> query
- Integration tests for upload -> analyze entities -> build timeline

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
3. Implement automatic entity extraction and narrative event pipeline
4. Implement retrieval-backed Q&A with citations and entity-aware timeline queries
5. Build the frontend upload, entity, chat, and timeline views
6. Add tests, Docker Compose polish, and documentation cleanup

## Success Criteria

- A new user can run the project locally with documented setup steps
- PDFs can be uploaded and indexed without manual intervention
- Questions return grounded answers with document/page citations
- Character or entity timelines are generated automatically after upload
- A query like "explain Karna's timeline in the whole novel" returns an ordered chain of events with evidence
- Core flows are covered by automated tests
- The codebase is modular, maintainable, and clearly more modern than the original prototype
