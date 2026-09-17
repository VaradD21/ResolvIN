export type TicketStatus =
  | 'NEW'
  | 'PROCESSING'
  | 'AUTO_RESOLVED'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'CLOSED';

export type TicketCategory =
  | 'WISMO'
  | 'RETURN'
  | 'EXCHANGE'
  | 'REFUND_STATUS'
  | 'CANCELLATION'
  | 'OTHER';

export interface TicketEventPayload {
  category?: TicketCategory;
  confidence?: number;
  extractedOrderId?: string | null;
  extractedIntent?: string | null;
  reasoning?: string;
  action?: string;
  eligible?: boolean;
  reason?: string;
  message?: string;
  [key: string]: unknown;
}

export interface TicketEvent {
  id: number;
  type: 'ticket_classified' | 'policy_checked' | 'action_taken' | 'replied' | 'escalated' | string;
  payload: TicketEventPayload;
  createdAt: string;
}

export interface TicketSummary {
  id: number;
  customerEmail: string;
  subject: string;
  body?: string;
  brandId: number;
  status: TicketStatus;
  category?: TicketCategory | null;
  confidence?: number | null;
  createdAt: string;
}

export interface TicketDetail extends TicketSummary {
  body: string;
  events?: TicketEvent[];
}

export interface CreateTicketRequest {
  customerEmail: string;
  subject: string;
  body: string;
  brandId: number;
}
