import { NextResponse } from 'next/server';
import { ICalService } from '@/lib/services/ical-service';

export async function GET() {
  try {
    const calendarUrl = 'https://calendar.google.com/calendar/ical/6up89jt0u9vsfhhgq61qr1is3bdi0tq9%40import.calendar.google.com/public/basic.ics';
    const icalService = new ICalService(calendarUrl);
    
    const csvContent = await icalService.exportToCSV();
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=calendar-events.csv'
      }
    });
  } catch (error) {
    console.error('Error exporting calendar:', error);
    return NextResponse.json(
      { error: 'Failed to export calendar' },
      { status: 500 }
    );
  }
} 