'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Database } from '@/lib/supabase/database.types';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

type WebhookExecution = Database['public']['Tables']['webhook_executions']['Row'];

interface WebhookExecutionHistoryProps {
  webhookId: string;
  webhookName: string;
}

export function WebhookExecutionHistory({ webhookId, webhookName }: WebhookExecutionHistoryProps) {
  const [executions, setExecutions] = useState<WebhookExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchExecutions() {
      try {
        const { data, error } = await supabase
          .rpc('get_webhook_executions', {
            p_webhook_id: webhookId,
            p_limit: 20
          });

        if (error) throw error;
        setExecutions(data as unknown as WebhookExecution[]);
      } catch (error: any) {
        console.error('Error fetching webhook executions:', error);
        toast({
          title: 'Error fetching execution history',
          description: error.message || 'Failed to load webhook execution history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchExecutions();

    // Set up real-time subscription
    const channel = supabase
      .channel('webhook_executions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webhook_executions',
        filter: `webhook_id=eq.${webhookId}`
      }, () => {
        fetchExecutions();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [webhookId, toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return null;
    // PostgreSQL interval comes in format like '00:00:00.123456'
    const matches = duration.match(/(\d+):(\d+):(\d+)\.?(\d+)?/);
    if (!matches) return duration;

    const [, hours, minutes, seconds] = matches;
    const parts = [];
    
    if (parseInt(hours) > 0) parts.push(`${parseInt(hours)}h`);
    if (parseInt(minutes) > 0) parts.push(`${parseInt(minutes)}m`);
    if (parseInt(seconds) > 0) parts.push(`${parseInt(seconds)}s`);
    
    return parts.join(' ') || '< 1s';
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
        <CardTitle className="text-lg">Execution History</CardTitle>
        <CardDescription>
          Recent executions for webhook &ldquo;{webhookName}&rdquo;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {executions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No executions found for this webhook.</p>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <Card key={execution.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(execution.status)}>
                          {execution.status}
                        </Badge>
                        {execution.response_code && (
                          <span className="text-sm text-muted-foreground">
                            Status: {execution.response_code}
                          </span>
                        )}
                      </div>
                      {execution.error_message && (
                        <p className="text-sm text-destructive">
                          {execution.error_message}
                        </p>
                      )}
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span suppressHydrationWarning>
                          {formatDistanceToNow(new Date(execution.executed_at), { addSuffix: true })}
                        </span>
                        {execution.execution_duration && (
                          <span>• Duration: {formatDuration(execution.execution_duration)}</span>
                        )}
                      </div>
                    </div>
                    <time className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {format(new Date(execution.executed_at), 'MMM d, yyyy HH:mm:ss')}
                    </time>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 