import { EventsGrid } from '@/components/events/events-grid';
import { EventsHeader } from '@/components/events/events-header';

export default function EventsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <EventsHeader />
      <EventsGrid />
    </div>
  );
} 