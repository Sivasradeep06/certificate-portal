import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();

  const rowSchema = z.object({
    name: z.string().min(1),
    register_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    status: z.enum(['participated', '1st', '2nd', '3rd']),
  });

  const batchSchema = z.object({
    participants: z.array(rowSchema).min(1),
  });

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const rows = parsed.data.participants.map((p) => ({
    ...p,
    event_id: eventId,
    email: p.email || null,
    register_number: p.register_number || null,
  }));

  const { data, error } = await supabase
    .from('participants')
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data: { inserted: data.length } },
    { status: 201 }
  );
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Support batch deleting by IDs, or clear all for the event
  const body = await request.json().catch(() => ({}));
  const { ids, clear_all } = body as { ids?: string[]; clear_all?: boolean };

  let query = supabase.from('participants').delete().eq('event_id', eventId);

  if (!clear_all) {
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'Provide ids or set clear_all to true' }, { status: 400 });
    }
    query = query.in('id', ids);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
