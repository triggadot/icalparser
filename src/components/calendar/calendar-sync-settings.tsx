'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Database } from '@/lib/supabase/database.types';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Calendar, Trash2 } from 'lucide-react';

type CalendarSyncSetting = Database['public']['Tables']['calendar_sync_settings']['Row'];
type CalendarSyncHistory = Database['public']['Tables']['calendar_sync_history']['Row'];

interface SyncHistoryItemProps {
  history: CalendarSyncHistory;
}

function SyncHistoryItem({ history }: SyncHistoryItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary">{status}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {getStatusBadge(history.status)}
          <span className="text-sm text-muted-foreground">
            {history.events_added} added • {history.events_updated} updated • {history.events_deleted} deleted
          </span>
        </div>
        {history.error_message && (
          <p className="text-sm text-destructive">{history.error_message}</p>
        )}
        <div className="text-xs text-muted-foreground">
          Duration: {history.duration || 'N/A'}
        </div>
      </div>
      <time className="text-xs text-muted-foreground" suppressHydrationWarning>
        {formatDistanceToNow(new Date(history.started_at), { addSuffix: true })}
      </time>
    </div>
  );
}

interface AddCalendarFormProps {
  onAdd: () => void;
}

function AddCalendarForm({ onAdd }: AddCalendarFormProps) {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [calendarId, setCalendarId] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('calendar_sync_settings')
        .insert({
          provider: provider as 'google' | 'outlook' | 'ical',
          calendar_id: calendarId,
        });

      if (error) throw error;

      toast({
        title: 'Calendar added',
        description: 'Calendar has been added successfully',
      });

      onAdd();
    } catch (error: any) {
      toast({
        title: 'Error adding calendar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Select
          value={provider}
          onValueChange={setProvider}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Calendar</SelectItem>
            <SelectItem value="outlook">Outlook Calendar</SelectItem>
            <SelectItem value="ical">iCal Feed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Calendar ID or URL"
          value={calendarId}
          onChange={(e) => setCalendarId(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Calendar
      </Button>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <Badge variant="secondary">{status}</Badge>;
    case 'failed':
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function CalendarSyncSettings() {
  const [settings, setSettings] = useState<CalendarSyncSetting[]>([]);
  const [history, setHistory] = useState<CalendarSyncHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('calendar_sync_settings')
          .select('*')
          .order('createdAt', { ascending: false });

        if (settingsError) throw settingsError;

        const { data: historyData, error: historyError } = await supabase
          .from('calendar_sync_history')
          .select('*')
          .order('syncedAt', { ascending: false })
          .limit(10);

        if (historyError) throw historyError;

        setSettings(settingsData || []);
        setHistory(historyData || []);
      } catch (error) {
        console.error('Error fetching calendar sync data:', error);
        toast({
          title: "Error fetching data",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }

    fetchData();

    const channel = supabase
      .channel('calendar_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_sync_settings'
      }, () => fetchData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_sync_history'
      }, () => fetchData())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [toast]);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('calendar_sync_settings')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isActive ? 'Calendar activated' : 'Calendar deactivated',
        description: `Calendar sync has been ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating calendar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_sync_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Calendar removed',
        description: 'Calendar has been removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error removing calendar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar Sync</h2>
        <Button onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Calendar
        </Button>
      </div>

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Calendar</CardTitle>
            <CardDescription>
              Configure a new calendar for synchronization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddCalendarForm onAdd={() => setAdding(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Connected Calendars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {settings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No calendars configured
                </p>
              ) : (
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <Card key={setting.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge>
                              {setting.provider.toUpperCase()}
                            </Badge>
                            <Badge variant={setting.is_active ? "default" : "secondary"}>
                              {setting.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm">{setting.calendar_id}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>
                              Syncs every {setting.sync_frequency}
                            </span>
                            {setting.last_synced && (
                              <span suppressHydrationWarning>
                                • Last synced {formatDistanceToNow(new Date(setting.last_synced), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={setting.is_active}
                            onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(setting.id)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
            <CardDescription>
              Recent calendar synchronization activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sync history available
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <SyncHistoryItem key={item.id} history={item} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 