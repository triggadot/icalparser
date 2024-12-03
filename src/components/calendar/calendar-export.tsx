'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, DownloadIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/lib/services/ical-service';

export const CalendarExport = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/calendar/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-events-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting calendar:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendar Export</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>
    </div>
  );
}; 