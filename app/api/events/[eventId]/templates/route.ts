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
    .from('certificate_templates')
    .select('*')
    .eq('event_id', eventId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

const placeholderConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['name', 'register_number', 'event_name', 'event_date', 'status']),
  x: z.number(),
  y: z.number(),
  fontSize: z.number().min(8).max(200),
  fontFamily: z.string(),
  fontWeight: z.enum(['normal', 'bold']),
  color: z.string(),
  align: z.enum(['left', 'center', 'right']),
  text: z.string().optional(),
});

const templateSchema = z.object({
  type: z.enum(['participation', 'winner']),
  background_url: z.string().url().optional().nullable(),
  canvas_width: z.number().default(1122),
  canvas_height: z.number().default(794),
  placeholder_config: z.array(placeholderConfigSchema).default([]),
});

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('certificate_templates')
    .upsert(
      { ...parsed.data, event_id: eventId },
      { onConflict: 'event_id,type' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();

  const updateSchema = z.object({
    type: z.enum(['participation', 'winner']),
    background_url: z.string().url().optional().nullable(),
    placeholder_config: z.array(placeholderConfigSchema).optional(),
  });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { type, ...updateData } = parsed.data;

  const { data, error } = await supabase
    .from('certificate_templates')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('type', type)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
