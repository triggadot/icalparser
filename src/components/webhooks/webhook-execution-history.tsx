'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Database } from '@/lib/supabase/database.types';

type WebhookEvent = Database['public']['Tables']['webhook_events']['Row'];

interface WebhookExecutionHistoryProps {
  webhookId: string;
}

export function WebhookExecutionHistory({ webhookId }: WebhookExecutionHistoryProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching webhook events:', error);
    } finally {
      setLoading(false);
    }
  }, [webhookId]);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('webhook_events_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'webhook_events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchEvents]);

  const getStatusBadge = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'retrying':
        return <Badge variant="secondary" className="text-yellow-500">Retrying</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No executions yet
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 py-2 border-b last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.status)}
                    <span className="text-sm font-medium">{event.event_type}</span>
                  </div>
                  {event.error_message && (
                    <p className="text-sm text-destructive">{event.error_message}</p>
                  )}
                  {event.response_status && (
                    <p className="text-sm text-muted-foreground">
                      Response: {event.response_status}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(event.created_at), 'PPp')}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 