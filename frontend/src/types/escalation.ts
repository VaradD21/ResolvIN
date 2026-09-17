import { TicketCategory } from './ticket';

export interface ClassificationBundle {
  category?: TicketCategory;
  confidence?: number;
  extractedOrderId?: string | null;
  extractedIntent?: string | null;
  reasoning?: string;
  [key: string]: unknown;
}

export interface PolicyDecisionBundle {
  eligible?: boolean;
  action?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface ContextBundle {
  subject?: string;
  body?: string;
  classification?: ClassificationBundle;
  decision?: PolicyDecisionBundle;
  [key: string]: unknown;
}

export type ResolutionActionType =
  | 'APPROVED_REFUND'
  | 'APPROVED_EXCHANGE'
  | 'APPROVED_CANCEL'
  | 'DENIED'
  | 'NEEDS_MORE_INFO';

export interface ResolveEscalationRequest {
  resolutionAction: ResolutionActionType;
  resolutionNote?: string;
  resolvedBy?: string;
}

export interface Escalation {
  id: number;
  ticketId: number;
  reason: string;
  subject: string;
  customerEmail: string;
  contextBundle: ContextBundle;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionNote?: string | null;
  resolutionAction?: ResolutionActionType | null;
}

