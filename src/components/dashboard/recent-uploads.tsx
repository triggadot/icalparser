'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CalendarEventRow } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload } from 'lucide-react';
import Link from 'next/link';
import { SlideIn } from '@/components/motion/slide-in';
import { CardSkeleton } from '@/components/ui/skeleton';

export function RecentUploads() {
  const [uploads, setUploads] = useState<CalendarEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentUploads() {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('createdAt', sevenDaysAgo.toISOString())
          .order('createdAt', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        const transformedData: CalendarEventRow[] = data.map(event => ({
          id: event.id,
          summary: event.title,
          description: null,
          location: null,
          start_date: event.startTime,
          end_date: event.endTime,
          created_at: event.createdAt,
          last_modified: event.createdAt,
          status: 'confirmed',
          organizer: null,
          sync_status: 'synced',
          tracking_number: null,
          tracking_link: null,
          service: null,
          state_abbreviation: null
        }));

        setUploads(transformedData);
      } catch (error) {
        console.error('Error fetching recent uploads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentUploads();
  }, []);

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <SlideIn direction="right" delay={0.2}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Recent Uploads</CardTitle>
          <Link href="/upload">
            <Button variant="ghost" size="sm" className="gap-2">
              Upload
              <Upload className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent uploads
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload, index) => (
                <SlideIn
                  key={upload.id}
                  direction="right"
                  delay={0.1 * (index + 1)}
                >
                  <div className="flex items-start justify-between gap-4 py-2">
                    <div className="space-y-1">
                      <p className="font-medium">{upload.summary}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {format(parseISO(upload.created_at), 'PPp')}
                      </p>
                    </div>
                  </div>
                </SlideIn>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </SlideIn>
  );
} 