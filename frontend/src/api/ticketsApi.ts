import { request, ApiRequestError } from './client';
import {
  TicketSummary,
  TicketDetail,
  CreateTicketRequest,
  TicketEvent,
} from '../types/ticket';
import { PaginatedResponse } from '../types/api';
import { MOCK_TICKETS, MOCK_TIMELINE_EVENTS } from '../constants/mockData';

export interface TicketsListResult extends PaginatedResponse<TicketSummary> {
  isStubbed: boolean;
  missingEndpoint: boolean;
}

export async function createTicket(req: CreateTicketRequest): Promise<TicketSummary> {
  return request<TicketSummary>('/tickets', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getTicket(id: number): Promise<TicketDetail> {
  // Check if it's one of the mock tickets
  const mockMatch = MOCK_TICKETS.find((t) => t.id === id);

  try {
    const ticket = await request<TicketDetail>(`/tickets/${id}`);
    
    // If backend doesn't yet include events timeline in GET /tickets/{id},
    // provide an empty array (or mock events if requested for testing)
    const events: TicketEvent[] = Array.isArray(ticket.events) ? ticket.events : [];
    
    return {
      ...ticket,
      events,
    };
  } catch (error) {
    if (mockMatch) {
      return {
        ...mockMatch,
        body: `Customer inquired regarding support issue #${id}. System auto-simulated ticket details.`,
        events: MOCK_TIMELINE_EVENTS,
      };
    }
    throw error;
  }
}

export async function listTickets(page = 0, size = 10): Promise<TicketsListResult> {
  try {
    const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
    const data = await request<PaginatedResponse<TicketSummary> | TicketSummary[]>(`/tickets?${query}`);

    if (Array.isArray(data)) {
      return {
        content: data,
        totalElements: data.length,
        totalPages: 1,
        size,
        number: page,
        isStubbed: false,
        missingEndpoint: false,
      };
    }

    if (data && Array.isArray(data.content)) {
      return {
        ...data,
        isStubbed: false,
        missingEndpoint: false,
      };
    }

    throw new Error('Unexpected data format from GET /tickets');
  } catch (err) {
    const is404 = err instanceof ApiRequestError && (err.status === 404 || err.status === 405);
    // Backend has no GET /tickets endpoint yet; return stubbed mock tickets
    return {
      content: MOCK_TICKETS,
      totalElements: MOCK_TICKETS.length,
      totalPages: 1,
      size,
      number: page,
      isStubbed: true,
      missingEndpoint: is404,
    };
  }
}
