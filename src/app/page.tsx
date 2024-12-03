'use client';

import { useEffect, useState, Suspense } from 'react';
import { WebhookList } from "@/components/webhooks/webhook-list";
import { CreateWebhookButton } from "@/components/webhooks/create-webhook-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Calendar, Webhook, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Database } from '@/lib/supabase/database.types';
import { PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

type Tables = Database['public']['Tables']
type CalendarEvent = Tables['calendar_events']['Row']
type ActivityLog = Tables['activity_logs']['Row']

interface Stats {
  totalEvents: number;
  activeWebhooks: number;
  upcomingEvents: number;
}

function StatsCard({ 
  title, 
  value, 
  loading,
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  loading?: boolean;
  icon: React.ElementType;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function EventList({ events }: { events: CalendarEvent[] }) {
  return (
    <ScrollArea className="h-[300px] w-full">
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4">No events scheduled</p>
      ) : (
        <div className="space-y-4 p-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startTime), 'PPp')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(new Date(event.endTime), 'p')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

function ActivityList({ activities }: { activities: ActivityLog[] }) {
  return (
    <ScrollArea className="h-[300px] w-full">
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4">No recent activity</p>
      ) : (
        <div className="space-y-4 p-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 text-sm">
              <time className="text-muted-foreground w-32">
                {format(new Date(activity.createdAt), 'PP')}
              </time>
              <span>{activity.action}</span>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    activeWebhooks: 0,
    upcomingEvents: 0
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch total events
        const { data: eventsData, error: eventsError } = await supabase
          .from('calendar_events')
          .select('*') as { data: CalendarEvent[] | null; error: PostgrestError | null };

        if (eventsError) throw eventsError;

        // Fetch upcoming events
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('startTime', new Date().toISOString())
          .order('startTime', { ascending: true })
          .limit(5) as { data: CalendarEvent[] | null; error: PostgrestError | null };

        if (upcomingError) throw upcomingError;

        // Fetch webhooks
        const { data: webhooksData, error: webhooksError } = await supabase
          .from('webhooks')
          .select('*')
          .eq('active', true) as { data: Tables['webhooks']['Row'][] | null; error: PostgrestError | null };

        if (webhooksError) throw webhooksError;

        // Fetch activity logs
        const { data: activityData, error: activityError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(10) as { data: ActivityLog[] | null; error: PostgrestError | null };

        if (activityError) throw activityError;

        // Update state with fetched data
        setStats({
          totalEvents: eventsData?.length ?? 0,
          activeWebhooks: webhooksData?.length ?? 0,
          upcomingEvents: upcomingData?.length ?? 0
        });
        
        if (upcomingData) setEvents(upcomingData);
        if (activityData) setActivities(activityData);

      } catch (error) {
        console.error('Error fetching data:', error);
        
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          const pgError = error as PostgrestError;
          errorMessage = pgError.message || errorMessage;
        }
        
        toast({
          title: "Error fetching data",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Set up real-time subscriptions
    const eventsSubscription = supabase
      .channel('calendar_events_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'calendar_events' 
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your calendar events and integrations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Total Events" 
          value={stats.totalEvents} 
          loading={loading} 
          icon={Calendar} 
        />
        <StatsCard 
          title="Active Webhooks" 
          value={stats.activeWebhooks} 
          loading={loading} 
          icon={Webhook} 
        />
        <StatsCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents} 
          loading={loading} 
          icon={Activity} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px]" />}>
              <EventList events={events} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px]" />}>
              <ActivityList activities={activities} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Webhooks Section */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </CardTitle>
            <CreateWebhookButton />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[200px]" />}>
              <WebhookList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
