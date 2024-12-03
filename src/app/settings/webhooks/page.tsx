import { WebhookList } from "@/components/webhooks/webhook-list";
import { CreateWebhookButton } from "@/components/webhooks/create-webhook-button";

export default function WebhooksPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">
            Manage your webhook integrations and notifications
          </p>
        </div>
        <CreateWebhookButton />
      </div>
      <WebhookList />
    </div>
  );
} 