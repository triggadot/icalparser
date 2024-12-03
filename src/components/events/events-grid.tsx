'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { CalendarEventRow } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export function EventsGrid() {
  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      let query = supabase
        .from('calendar_events')
        .select('*', { count: 'exact' });

      // Apply search filter
      const searchTerm = searchParams.get('query');
      if (searchTerm) {
        query = query.or(
          `summary.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Apply status filter
      const status = searchParams.get('status')?.split(',');
      if (status?.length) {
        query = query.in('status', status);
      }

      // Apply pagination
      query = query
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .order('start_date', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
      setTotalCount(count || 0);
      setLoading(false);
    };

    fetchEvents();
  }, [searchParams, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Summary</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.summary}</TableCell>
                <TableCell>
                  {format(parseISO(event.start_date), 'PPp')}
                </TableCell>
                <TableCell>
                  {format(parseISO(event.end_date), 'PPp')}
                </TableCell>
                <TableCell>{event.location || '-'}</TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
          {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} events
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page - 1).toString());
              replace(`${pathname}?${params.toString()}`);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * PAGE_SIZE >= totalCount}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', (page + 1).toString());
              replace(`${pathname}?${params.toString()}`);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 