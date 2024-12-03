'use client';

import { useEffect, useState, useCallback } from 'react';
import { Webhook } from '@/types/webhook';
import { WebhookItem } from './webhook-item';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export const WebhookList = () => {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/webhooks', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setWebhooks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch webhooks';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to load webhooks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex items-center space-x-4 p-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-8 w-[60px]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load webhooks. Please try again.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsRetrying(true);
              fetchWebhooks();
            }}
            className="ml-2"
            disabled={isRetrying}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        </AlertDescription>
      </Alert>
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
              onUpdate={() => {
                router.refresh();
                fetchWebhooks();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 