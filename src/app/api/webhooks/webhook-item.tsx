import { Webhook } from '@/types/webhook'
import { Switch } from '@/components/ui/switch'

interface WebhookItemProps {
  webhook: Webhook
  onToggle: (id: string, isActive: boolean) => void
}

export function WebhookItem({ webhook, onToggle }: WebhookItemProps) {
  const handleToggle = async (checked: boolean) => {
    onToggle(webhook.id, checked)
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h3 className="font-medium">{webhook.name}</h3>
        <p className="text-sm text-gray-500">{webhook.url}</p>
      </div>
      <Switch
        checked={webhook.active}
        onCheckedChange={handleToggle}
        aria-label="Toggle webhook"
      />
    </div>
  )
} 