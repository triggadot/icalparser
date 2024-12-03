'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package2, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export function CalendarGrid() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

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
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          <div className="space-y-4">
            <h3 className="font-semibold">
              Events for {selectedDate ? format(selectedDate, 'PP') : 'No date selected'}
            </h3>
            {loading ? (
              <div>Loading events...</div>
            ) : selectedDate ? (
              getDayEvents(selectedDate).length > 0 ? (
                getDayEvents(selectedDate).map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(event.service)}
                        <span className="font-medium">{event.title}</span>
                      </div>
                      {event.tracking_number && (
                        <div className="text-sm text-muted-foreground">
                          Tracking: {event.tracking_number}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {event.start_time ? format(new Date(`${event.start_date}T${event.start_time}`), 'p') : 'All day'}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(event.status)} text-white`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div>No events for this date</div>
              )
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 