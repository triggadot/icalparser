export interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  description?: string;
  createdAt: string;
  lastTriggered?: string | null;
} 