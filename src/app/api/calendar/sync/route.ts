import { NextResponse } from 'next/server';
import { CalendarSyncService } from '@/lib/services/calendar-sync';

export async function POST() {
  try {
    const syncService = new CalendarSyncService();
    await syncService.syncCalendar();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Calendar sync completed successfully' 
    });
  } catch (error) {
    console.error('Error in calendar sync endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to sync calendar',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Allow GET requests for easier testing
export async function GET() {
  return POST();
} 