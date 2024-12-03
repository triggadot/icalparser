'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package2, Truck } from 'lucide-react';
import Link from 'next/link';
import { Database } from '@/lib/supabase/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_date', now.split('T')[0])
          .order('start_date', { ascending: true })
          .limit(5);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingEvents();
  }, []);

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'in_transit':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getServiceIcon = (service: CalendarEvent['service']) => {
    switch (service) {
      case 'UPS':
      case 'FedEx':
      case 'USPS':
        return <Truck className="h-4 w-4" />;
      default:
        return <Package2 className="h-4 w-4" />;
    }
  };

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
                  <div className="flex items-center gap-2">
                    {getServiceIcon(event.service)}
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {event.start_time
                        ? format(new Date(`${event.start_date}T${event.start_time}`), 'PPp')
                        : format(new Date(event.start_date), 'PP')}
                    </span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                  {event.tracking_number && (
                    <div className="text-sm text-muted-foreground">
                      Tracking: {event.tracking_number}
                    </div>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(event.status)} text-white`}
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