import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import ical from 'node-ical';
import { Database } from '@/lib/supabase/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

function formatDateTime(dateTime: Date | undefined | null) {
  if (!dateTime) return { date: null, time: null };
  
  const date = dateTime.toISOString().split('T')[0];
  const time = dateTime.toTimeString().split(' ')[0];
  
  return { date, time };
}

function convertStatus(status: string | undefined): 'pending' | 'delivered' | 'cancelled' {
  if (!status) return 'pending';
  return status.toLowerCase() === 'cancelled' ? 'cancelled' : 'pending';
}

export async function GET() {
  try {
    const calendarUrl = process.env.CALENDAR_URL;
    if (!calendarUrl) {
      return NextResponse.json({ error: 'Calendar URL not configured' }, { status: 500 });
    }

    // Fetch and parse calendar events
    const events = await ical.async.fromURL(calendarUrl);
    
    let processedCount = 0;
    let errorCount = 0;

    for (const [key, event] of Object.entries(events)) {
      if (event.type !== 'VEVENT') continue;

      try {
        const start = formatDateTime(event.start);
        const end = formatDateTime(event.end);
        
        const { error } = await supabase.rpc('process_calendar_event', {
          p_event_id: key,
          p_title: event.summary || '',
          p_description: event.description || '',
          p_start_date: start.date,
          p_start_time: start.time,
          p_end_date: end.date,
          p_end_time: end.time,
          p_status: convertStatus(event.status)
        });

        if (error) throw error;
        processedCount++;
      } catch (err) {
        console.error('Error processing event:', err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}

// Run sync every 30 minutes
export const dynamic = 'force-dynamic';
export const revalidate = 1800; 