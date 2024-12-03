import { format, parseISO } from 'date-fns'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { Event } from '@/types/event'

export async function GET() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('startTime', { ascending: true })
      .returns<Event[]>()

    if (error) {
      throw error
    }

    // Convert data to CSV format
    const csvContent = [
      ['Title', 'Start Date', 'End Date', 'Location', 'Description'].join(','),
      ...data.map((event: Event) => [
        `"${event.title}"`,
        format(parseISO(event.startTime), 'yyyy-MM-dd HH:mm:ss'),
        format(parseISO(event.endTime), 'yyyy-MM-dd HH:mm:ss'),
        `"${event.location || ''}"`,
        `"${event.description || ''}"`,
      ].join(','))
    ].join('\n')

    // Create response with CSV content
    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', 'attachment; filename=events.csv')

    return response
  } catch (error) {
    console.error('Error exporting events:', error)
    return NextResponse.json({ error: 'Failed to export events' }, { status: 500 })
  }
} 