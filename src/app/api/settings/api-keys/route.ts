import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { name, permissions, expiresIn } = await request.json();

    // Generate a secure API key
    const apiKey = `ical_${nanoid(32)}`;
    const hashedKey = createHash('sha256').update(apiKey).digest('hex');

    // Calculate expiration date if provided
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

    // Insert the new API key into the database
    const { error } = await supabase.from('api_keys').insert({
      name,
      key_hash: hashedKey,
      permissions,
      expires_at: expiresAt,
      is_active: true,
    });

    if (error) throw error;

    // Return the unhashed API key (this is the only time it will be visible)
    return NextResponse.json({ key: apiKey });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { id } = await request.json();

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { id, is_active } = await request.json();

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
} 