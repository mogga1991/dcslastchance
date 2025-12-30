export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationTimeMs?: number;
  };
}

export interface OpportunityChat {
  id: string;
  userId: string;
  opportunityId: string;
  opportunityTitle: string;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
