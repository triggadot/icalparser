'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarEventRow } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react';

interface EventDetailsDialogProps {
  event: CalendarEventRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
}: EventDetailsDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event.summary}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(parseISO(event.start_date), 'PPP')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {format(parseISO(event.start_date), 'p')} - {format(parseISO(event.end_date), 'p')}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            <Badge
              variant={
                event.status === 'confirmed'
                  ? 'default'
                  : event.status === 'tentative'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {event.status}
            </Badge>
          </div>

          {event.description && (
            <div className="prose prose-sm max-w-none">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Last modified {format(parseISO(event.last_modified), 'PPp')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 