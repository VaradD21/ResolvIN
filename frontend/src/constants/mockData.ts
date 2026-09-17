import { Brand } from '../types/brand';
import { TicketSummary, TicketEvent } from '../types/ticket';

export const FALLBACK_BRANDS: Brand[] = [
  { id: 1, name: 'Acme Clothing (Seed)', slug: 'acme' },
  { id: 2, name: 'Urban Loom (D2C)', slug: 'urban-loom' },
  { id: 3, name: 'ChaiCraft Botanicals', slug: 'chaicraft' },
];

export const MOCK_TICKETS: TicketSummary[] = [
  {
    id: 101,
    customerEmail: 'arjun.mehta@example.in',
    subject: 'Where is my order? #ORD-9842',
    brandId: 1,
    status: 'AUTO_RESOLVED',
    category: 'WISMO',
    confidence: 0.96,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 102,
    customerEmail: 'priya.sharma@example.in',
    subject: 'Received broken ceramic mug in order #ORD-9811',
    brandId: 1,
    status: 'ESCALATED',
    category: 'RETURN',
    confidence: 0.88,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 103,
    customerEmail: 'rahul.verma@example.in',
    subject: 'Need size M instead of L for linen shirt',
    brandId: 1,
    status: 'AUTO_RESOLVED',
    category: 'EXCHANGE',
    confidence: 0.94,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 104,
    customerEmail: 'deepa.nair@example.in',
    subject: 'Refund not credited to UPI after return #ORD-9750',
    brandId: 1,
    status: 'ESCALATED',
    category: 'REFUND_STATUS',
    confidence: 0.91,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 105,
    customerEmail: 'kabir.singh@example.in',
    subject: 'Cancel order immediately before shipping',
    brandId: 1,
    status: 'PROCESSING',
    category: 'CANCELLATION',
    confidence: 0.82,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const MOCK_TIMELINE_EVENTS: TicketEvent[] = [
  {
    id: 1,
    type: 'ticket_classified',
    payload: {
      category: 'WISMO',
      confidence: 0.96,
      extractedOrderId: 'ORD-9842',
      extractedIntent: 'Inquiring about shipment tracking & delivery estimate',
      reasoning: 'Customer provided order number and asked for package location.',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
  },
  {
    id: 2,
    type: 'policy_checked',
    payload: {
      eligible: true,
      action: 'REPLY_ONLY',
      reason: 'Order #ORD-9842 found in cache. Fulfillment status is in_transit with active Bluedart tracking number.',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
  },
  {
    id: 3,
    type: 'action_taken',
    payload: {
      action: 'REPLY_ONLY',
      reason: 'Automated fulfillment status dispatch',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 4,
    type: 'replied',
    payload: {
      message: 'Your order status is: in_transit (Tracking: BLUEDART-IN-88392112). Estimated delivery is tomorrow before 7 PM.',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
];
