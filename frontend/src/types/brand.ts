export interface Brand {
  id: number;
  name: string;
  slug: string;
  policy?: Record<string, unknown>;
  createdAt?: string;
}
