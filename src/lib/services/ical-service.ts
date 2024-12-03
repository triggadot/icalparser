import ical from 'node-ical';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import type { CalendarEventRow } from '@/types/database';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  created: Date;
  lastModified: Date;
  status: string;
  organizer?: string;
}

export class ICalService {
  private calendarUrl: string;

  constructor(calendarUrl: string) {
    this.calendarUrl = calendarUrl;
  }

  async fetchEvents(): Promise<CalendarEvent[]> {
    try {
      const events = await ical.async.fromURL(this.calendarUrl);
      return Object.values(events)
        .filter(event => event.type === 'VEVENT')
        .map(event => ({
          id: event.uid,
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
          created: event.created,
          lastModified: event.lastModified,
          status: event.status,
          organizer: event.organizer?.val
        }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async exportToCSV(): Promise<string> {
    const events = await this.fetchEvents();
    const headers = [
      'Summary',
      'Start Date',
      'End Date',
      'Location',
      'Description',
      'Status'
    ];

    const rows = events.map(event => [
      event.summary,
      format(event.start, 'yyyy-MM-dd HH:mm:ss'),
      format(event.end, 'yyyy-MM-dd HH:mm:ss'),
      event.location || '',
      event.description || '',
      event.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  async syncToSupabase(): Promise<void> {
    const events = await this.fetchEvents();
    
    const { data: existingEvents, error: fetchError } = await supabase
      .from('calendar_events')
      .select('id');
    
    if (fetchError) throw fetchError;
    
    const existingIds = new Set(existingEvents?.map(e => e.id));
    
    const eventsToUpsert = events.map(event => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start_date: format(event.start, 'yyyy-MM-dd HH:mm:ss'),
      end_date: format(event.end, 'yyyy-MM-dd HH:mm:ss'),
      created_at: format(event.created, 'yyyy-MM-dd HH:mm:ss'),
      last_modified: format(event.lastModified, 'yyyy-MM-dd HH:mm:ss'),
      status: event.status,
      organizer: event.organizer,
      sync_status: 'synced' as const
    }));

    const { error: upsertError } = await supabase
      .from('calendar_events')
      .upsert(eventsToUpsert);

    if (upsertError) throw upsertError;
  }
} 