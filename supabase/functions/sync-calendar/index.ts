import { serve } from 'https://deno.fresh.dev/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse } from 'https://deno.fresh.dev/std@0.168.0/datetime/mod.ts';
import ical from 'https://esm.sh/node-ical';

interface TrackingInfo {
  trackingNumber: string;
  trackingLink: string;
  service: string;
  stateAbbreviation: string;
}

interface ParsedDateTime {
  date: string;
  time: string;
}

serve(async (req) => {
  try {
    // Create Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const calendarUrl = Deno.env.get('CALENDAR_URL');
    if (!calendarUrl) {
      throw new Error('CALENDAR_URL environment variable is not set');
    }

    console.log('Starting calendar sync...');
    console.log('Fetching calendar data from:', calendarUrl);

    // Fetch events from iCal URL
    const response = await fetch(calendarUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data: ${response.status} ${response.statusText}`);
    }

    const icalData = await response.text();
    const events = await ical.async.parseICS(icalData);
    const processedEvents = [];

    // Process each event
    for (const [key, event] of Object.entries(events)) {
      if (event.type !== 'VEVENT') continue;

      try {
        const title = event.summary || '';
        const description = event.description || '';
        const { trackingNumber, trackingLink, service, stateAbbreviation } = parseDeliveryInfo(title, description);

        const eventData = {
          id: event.uid,
          summary: title,
          description: description,
          location: event.location || null,
          start_date: new Date(event.start).toISOString(),
          end_date: new Date(event.end).toISOString(),
          status: convertStatus(event.status || ''),
          organizer: event.organizer?.val || null,
          sync_status: 'synced',
          tracking_number: trackingNumber,
          tracking_link: trackingLink,
          service: service,
          state_abbreviation: stateAbbreviation,
          last_modified: new Date().toISOString()
        };

        // Upsert event to database
        const { error } = await supabaseClient
          .from('calendar_events')
          .upsert(eventData, {
            onConflict: 'id',
            returning: 'minimal'
          });

        if (error) {
          console.error('Error upserting event:', { eventId: event.uid, error });
          continue; // Continue with next event even if this one fails
        }

        processedEvents.push(event.uid);
      } catch (error) {
        console.error('Error processing event:', { eventId: event.uid, error });
        continue;
      }
    }

    console.log('Calendar sync completed successfully');
    console.log('Processed events:', processedEvents.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Calendar sync completed successfully',
        timestamp: new Date().toISOString(),
        processed_events: processedEvents.length
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in calendar sync:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to sync calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function parseDeliveryInfo(title: string, description: string): TrackingInfo {
  // Parse tracking info
  const trackingNumberMatch = description.match(/Tracking Number:\s*(\S+)/i);
  const trackingLinkMatch = description.match(/(https?:\/\/\S+)/i);
  
  // Parse service (UPS or FedEx)
  let service = '';
  if (title.toLowerCase().includes('ups')) service = 'UPS';
  else if (title.toLowerCase().includes('fedex')) service = 'FedEx';
  
  // Parse state abbreviation (e.g., "CA12345" -> "CA")
  const stateMatch = title.match(/^([A-Z]{2})\d/);
  
  return {
    trackingNumber: trackingNumberMatch ? trackingNumberMatch[1] : '',
    trackingLink: trackingLinkMatch ? trackingLinkMatch[0] : '',
    service: service,
    stateAbbreviation: stateMatch ? stateMatch[1] : ''
  };
}

function convertStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'cancelled': 'delivered',
    'confirmed': 'active',
    'tentative': 'pending'
  };
  
  return statusMap[status.toLowerCase()] || status.toLowerCase();
} 