import { request } from './client';
import { Escalation, ResolveEscalationRequest } from '../types/escalation';

export async function getUnresolvedEscalations(): Promise<Escalation[]> {
  const data = await request<Escalation[]>('/escalations');
  return Array.isArray(data) ? data : [];
}

export async function resolveEscalation(
  id: number,
  payload: ResolveEscalationRequest
): Promise<Escalation> {
  return request<Escalation>(`/escalations/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
