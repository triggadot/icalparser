'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarSyncSettings } from "@/components/calendar/calendar-sync-settings";
import { WebhookExecutionHistory } from "@/components/webhooks/webhook-execution-history";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="calendar">Calendar Sync</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarSyncSettings />
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="p-6">
            <WebhookExecutionHistory
              webhookId="all"
              webhookName="All Webhooks"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 