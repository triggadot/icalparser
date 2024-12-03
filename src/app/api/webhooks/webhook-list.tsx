// src/components/webhooks/webhook-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { Webhook } from '@/types/webhook';
import { WebhookItem } from './webhook-item';

export const WebhookList = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await fetch('/api/webhooks');
        if (!response.ok) throw new Error('Failed to fetch webhooks');
        const data = await response.json();
        setWebhooks(data);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebhooks();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {webhooks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">
            No webhooks configured. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {webhooks.map((webhook) => (
            <WebhookItem 
              key={webhook.id} 
              webhook={webhook}
              onToggle={async (isActive) => {
                try {
                  await fetch(`/api/webhooks/${webhook.id}/toggle`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive }),
                  });
                } catch (error) {
                  console.error('Error toggling webhook:', error);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};