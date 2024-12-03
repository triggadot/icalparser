// src/app/api/calendar/upload/route.ts
import { NextResponse } from 'next/server';
import { ICalService } from '@/lib/services/ical-service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const tempUrl = `data:text/calendar;base64,${btoa(fileContent)}`;
    
    const icalService = new ICalService(tempUrl);
    await icalService.syncToSupabase();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}