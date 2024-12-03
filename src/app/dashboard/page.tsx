'use client';

import { Suspense } from 'react';
import CalendarStats from './calendar-stats';
import { RecentUploads } from '@/components/dashboard/recent-uploads';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { PageTransition } from '@/components/motion/page-transition';
import { StatsSkeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your calendar events and activities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<StatsSkeleton />}>
            <CalendarStats />
          </Suspense>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<div>Loading uploads...</div>}>
            <RecentUploads />
          </Suspense>
          
          <Suspense fallback={<div>Loading events...</div>}>
            <UpcomingEvents />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  );
} 