'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from '@/lib/supabase/database.types';
import { Switch } from "@/components/ui/switch";
import { Trash2 } from 'lucide-react';

type Webhook = Database['public']['Tables']['webhooks']['Row'];

interface WebhookItemProps {
  webhook: Webhook;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

export function WebhookItem({ webhook, onToggle, onDelete }: WebhookItemProps) {
  const handleToggle = () => {
    onToggle(webhook.id, !webhook.active);
  };

  const handleDelete = () => {
    onDelete(webhook.id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) return null;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {webhook.name}
              <Badge
                variant={webhook.active ? "default" : "secondary"}
                className="ml-2"
              >
                {webhook.active ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            {webhook.description && (
              <CardDescription>{webhook.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={webhook.active}
              onCheckedChange={handleToggle}
              aria-label="Toggle webhook"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground break-all">
          {webhook.url}
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground mt-2">
          {webhook.createdAt && (
            <span suppressHydrationWarning>
              Created {formatDate(webhook.createdAt)}
            </span>
          )}
          {webhook.lastTriggered && (
            <span suppressHydrationWarning>
              • Last triggered {formatDate(webhook.lastTriggered)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 