import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const query = supabase
    .from('events')
    .select('*, participants(count)')
    .order('created_at', { ascending: false });

  // Non-authenticated users only see active events
  if (!user) {
    query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format the joined count
  const formattedData = data.map((event: any) => ({
    ...event,
    participant_count: event.participants?.[0]?.count || 0,
    participants: undefined, // Strip the nested array
  }));

  return NextResponse.json({ data: formattedData });
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();

  const { z } = await import('zod');
  const eventSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional().nullable(),
    event_date: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
  });

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('events')
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
