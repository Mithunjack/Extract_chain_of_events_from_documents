export type DocumentSummary = {
  id: string;
  filename: string;
  status: string;
  page_count: number;
  summary?: string | null;
  created_at: string;
  updated_at: string;
};

export type EntitySummary = {
  id: string;
  canonical_name: string;
  entity_type: string;
  aliases: string[];
  mention_count: number;
};

export type TimelineEvent = {
  id: string;
  title: string;
  summary: string;
  sequenceIndex: number;
  eventPhase: string;
  sourcePage: number;
  confidence: number;
};

export type TimelineResponse = {
  entity: string;
  documentId: string;
  overview: string;
  events: TimelineEvent[];
};

export type Citation = {
  page: number;
  quote: string;
};

export type ChatResponse = {
  answer: string;
  citations: Citation[];
};
