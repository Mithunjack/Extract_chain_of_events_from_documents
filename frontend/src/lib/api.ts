import type {
  ChatResponse,
  DocumentSummary,
  EntitySummary,
  TimelineResponse
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  listDocuments: () => request<DocumentSummary[]>("/documents"),
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ document: DocumentSummary }>("/documents/upload", {
      method: "POST",
      body: formData
    });
  },
  listEntities: (documentId: string) =>
    request<EntitySummary[]>(`/documents/${documentId}/entities`),
  getTimeline: (documentId: string, entityName: string) =>
    request<TimelineResponse>(
      `/timelines/${documentId}/${encodeURIComponent(entityName)}`
    ),
  askQuestion: (documentId: string, question: string) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, question })
    })
};
