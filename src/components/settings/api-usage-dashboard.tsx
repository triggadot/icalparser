'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';
import { Database } from '@/lib/supabase/database.types';

type ApiKeyUsage = Database['public']['Tables']['api_key_usage']['Row'];

export function ApiUsageDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [usageData, setUsageData] = useState<any[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [errorRate, setErrorRate] = useState(0);

  useEffect(() => {
    fetchUsageData();
  }, [timeRange]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const timeRangeInHours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - timeRangeInHours);

      const { data: usage, error } = await supabase
        .from('api_key_usage')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data for the chart
      const groupedData = groupUsageData(usage || [], timeRange);
      setUsageData(groupedData);

      // Calculate statistics
      if (usage) {
        setTotalRequests(usage.length);
        setAvgResponseTime(
          usage.reduce((acc, curr) => acc + curr.response_time, 0) / usage.length
        );
        setErrorRate(
          (usage.filter(u => u.status_code >= 400).length / usage.length) * 100
        );
      }
    } catch (error) {
      console.error('Error fetching API usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupUsageData = (data: ApiKeyUsage[], range: string) => {
    const format = range === '24h' ? 'HH:mm' : range === '7d' ? 'MM/dd' : 'MM/dd';
    const grouped = data.reduce((acc: any, curr) => {
      const time = format(new Date(curr.created_at), format);
      if (!acc[time]) {
        acc[time] = { time, requests: 0, avgResponseTime: 0 };
      }
      acc[time].requests++;
      acc[time].avgResponseTime = (acc[time].avgResponseTime * (acc[time].requests - 1) + curr.response_time) / acc[time].requests;
      return acc;
    }, {});

    return Object.values(grouped);
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
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchUsageData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(2)}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(var(--primary))"
                  name="Requests"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgResponseTime"
                  stroke="hsl(var(--destructive))"
                  name="Avg Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 