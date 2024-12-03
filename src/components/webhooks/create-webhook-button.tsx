'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateWebhookDialog } from './create-webhook-dialog';

export const CreateWebhookButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Webhook
      </Button>
      <CreateWebhookDialog 
        open={open} 
        onOpenChange={setOpen}
      />
    </>
  );
}; 