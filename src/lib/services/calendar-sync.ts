import { supabase } from '@/lib/supabase/client';
import ical from 'node-ical';
import { CalendarEventRow } from '@/types/database';

interface TrackingInfo {
  trackingNumber: string;
  trackingLink: string;
}

interface ParsedDateTime {
  date: string;
  time: string;
}

export class CalendarSyncService {
  private calendarUrl: string;

  constructor() {
    const calendarUrl = process.env.CALENDAR_URL;
    if (!calendarUrl) {
      throw new Error('CALENDAR_URL environment variable is not set');
    }
    this.calendarUrl = calendarUrl;
  }

  private formatDateTime(dateTime: Date | string | undefined): ParsedDateTime {
    if (!dateTime) return { date: '', time: '' };
    
    const date = new Date(dateTime);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toISOString().split('T')[1].split('.')[0]
    };
  }

  private convertStatus(status: string): string {
    return status.toLowerCase() === 'cancelled' ? 'delivered' : status;
  }

  private parseTrackingInfo(description: string | undefined): TrackingInfo {
    if (!description) return { trackingNumber: '', trackingLink: '' };
    
    const trackingNumberMatch = description.match(/Tracking Number:\s*(\S+)/i);
    const trackingLinkMatch = description.match(/(https?:\/\/\S+)/i);
    
    return {
      trackingNumber: trackingNumberMatch ? trackingNumberMatch[1] : '',
      trackingLink: trackingLinkMatch ? trackingLinkMatch[0] : ''
    };
  }

  private parseService(title: string): string {
    if (title.toLowerCase().includes('ups')) return 'UPS';
    if (title.toLowerCase().includes('fedex')) return 'FedEx';
    return '';
  }

  private parseStateAbbreviation(title: string): string {
    const stateMatch = title.match(/^([A-Z]{2})\d/);
    return stateMatch ? stateMatch[1] : '';
  }

  private async upsertEvent(event: any): Promise<void> {
    const start = this.formatDateTime(event.start);
    const end = this.formatDateTime(event.end);
    const trackingInfo = this.parseTrackingInfo(event.description);
    const title = event.summary || '';

    const eventData: Partial<CalendarEventRow> = {
      id: event.uid,
      summary: title,
      description: event.description || '',
      location: event.location || null,
      start_date: new Date(event.start).toISOString(),
      end_date: new Date(event.end).toISOString(),
      status: this.convertStatus(event.status || ''),
      organizer: event.organizer?.val || null,
      sync_status: 'synced'
    };

    const { error } = await supabase
      .from('calendar_events')
      .upsert(eventData, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error upserting event:', error);
      throw error;
    }
  }

  public async syncCalendar(): Promise<void> {
    try {
      console.log('Starting calendar sync...');
      const events = await ical.async.fromURL(this.calendarUrl);
      
      for (const [key, event] of Object.entries(events)) {
        if (event.type === 'VEVENT') {
          await this.upsertEvent(event);
        }
      }
      
      console.log('Calendar sync completed successfully');
    } catch (error) {
      console.error('Error syncing calendar:', error);
      throw error;
    }
  }
} 