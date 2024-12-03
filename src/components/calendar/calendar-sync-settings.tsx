'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Calendar, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/lib/supabase/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export function CalendarSyncSettings() {
  const [calendarUrl, setCalendarUrl] = useState('');
  const [provider, setProvider] = useState('ical');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSync = async () => {
    if (!calendarUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a calendar URL',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/calendar-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: calendarUrl,
          provider,
        }),
      });

      if (!response.ok) throw new Error('Failed to sync calendar');

      const data = await response.json();
      toast({
        title: 'Success',
        description: `Synced ${data.processed} events`,
      });

      fetchEvents();
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync calendar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Calendar Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ical">iCal</SelectItem>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Calendar URL</Label>
            <Input
              id="url"
              placeholder="Enter your calendar URL"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSync} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync Now
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events synced yet
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {event.service ? <Truck className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.start_time
                        ? format(new Date(`${event.start_date}T${event.start_time}`), 'PPp')
                        : format(new Date(event.start_date), 'PP')}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 