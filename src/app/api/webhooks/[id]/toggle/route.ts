// src/app/api/webhooks/[id]/toggle/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { isActive } = await request.json();

    const { data, error } = await supabase
      .from('webhooks')
      .update({ active: isActive })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error toggling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to toggle webhook' },
      { status: 500 }
    );
  }
}