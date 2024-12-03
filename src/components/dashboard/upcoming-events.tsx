'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CalendarEventRow } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('startTime', now)
          .order('startTime', { ascending: true })
          .limit(5);

        if (error) throw error;
        
        const transformedData: CalendarEventRow[] = data.map(event => ({
          id: event.id,
          summary: event.title,
          description: null,
          location: null,
          start_date: event.startTime,
          end_date: event.endTime,
          created_at: event.createdAt,
          last_modified: event.createdAt,
          status: 'confirmed',
          organizer: null,
          sync_status: 'synced',
          tracking_number: null,
          tracking_link: null,
          service: null,
          state_abbreviation: null
        }));

        setEvents(transformedData);
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingEvents();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
        <Link href="/events">
          <Button variant="ghost" size="sm" className="gap-2">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming events
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 py-2"
              >
                <div className="space-y-1">
                  <p className="font-medium">{event.summary}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(parseISO(event.start_date), 'PPp')}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 