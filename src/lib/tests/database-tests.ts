import { supabase } from '@/lib/supabase/client';

// Test calendar events
export const testCalendarEvent = async () => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      id: 'test-event-1',
      summary: 'Test Event',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      status: 'confirmed'
    })
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }
  console.log('Created event:', data);
  return data;
};

// Test webhook
export const testWebhook = async () => {
  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      name: 'Test Webhook',
      url: 'https://example.com/webhook',
      events: ['calendar.sync.completed'],
      retry_count: 3,
      timeout_ms: 5000
    })
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }
  console.log('Created webhook:', data);
  return data;
};

// Run all tests
export const runAllTests = async () => {
  console.log('Running database tests...');
  
  console.log('\nTesting Calendar Event Creation:');
  const eventResult = await testCalendarEvent();
  
  console.log('\nTesting Webhook Creation:');
  const webhookResult = await testWebhook();
  
  console.log('\nTest Results:');
  console.log('Calendar Event:', eventResult ? 'Success' : 'Failed');
  console.log('Webhook:', webhookResult ? 'Success' : 'Failed');
}; 