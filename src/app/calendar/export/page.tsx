import { CalendarExport } from '@/components/calendar/calendar-export';
import { CalendarGrid } from '@/components/calendar/calendar-grid';

export default function CalendarExportPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Calendar Export</h1>
        <CalendarExport />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Calendar Events</h2>
        <CalendarGrid />
      </div>
    </div>
  );
} 