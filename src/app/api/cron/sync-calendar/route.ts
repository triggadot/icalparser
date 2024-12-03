import { NextResponse } from 'next/server';
import { CalendarSyncService } from '@/lib/services/calendar-sync';

// This endpoint should be called by a cron service (e.g., Vercel Cron Jobs)
export async function GET(request: Request) {
  // Verify cron secret if provided
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && (!authHeader || authHeader !== `Bearer ${cronSecret}`)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const syncService = new CalendarSyncService();
    await syncService.syncCalendar();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cron calendar sync completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron calendar sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to sync calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 