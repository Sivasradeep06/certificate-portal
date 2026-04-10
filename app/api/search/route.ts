import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// In-memory rate limiter fallback (when Vercel KV is not available)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const { kv } = await import('@vercel/kv');
    const key = `rl:search:${ip}`;
    const count = await kv.incr(key);
    if (count === 1) {
      await kv.expire(key, 60);
    }
    return count <= 10;
  } catch {
    // Fallback: in-memory rate limiter for local dev
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
      return true;
    }

    entry.count++;
    return entry.count <= 10;
  }
}

const searchSchema = z.object({
  query: z.string().min(1).max(100).transform((v) => v.trim().toLowerCase()),
});

export async function POST(request: Request): Promise<NextResponse> {
  // Rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please enter a valid register number or email' },
      { status: 400 }
    );
  }

  const query = parsed.data.query;
  const supabase = await createClient();

  // Find participants matching the query
  const { data: participants, error: pError } = await supabase
    .from('participants')
    .select(`
      *,
      events!inner (*)
    `)
    .eq('events.is_active', true)
    .or(`register_number.ilike.${query},email.ilike.${query}`);

  if (pError) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  if (!participants || participants.length === 0) {
    return NextResponse.json({ data: [] });
  }

  // Build results with templates
  const results = await Promise.all(
    participants.map(async (p: Record<string, unknown>) => {
      const event = p.events as Record<string, unknown>;
      const templateType = p.status === 'participated' ? 'participation' : 'winner';

      const { data: template } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('event_id', p.event_id as string)
        .eq('type', templateType)
        .single();

      return {
        participant: {
          id: p.id,
          event_id: p.event_id,
          name: p.name,
          register_number: p.register_number,
          email: p.email,
          status: p.status,
          created_at: p.created_at,
        },
        event: {
          id: event.id,
          name: event.name,
          description: event.description,
          event_date: event.event_date,
          is_active: event.is_active,
          created_at: event.created_at,
        },
        template: template || null,
      };
    })
  );

  return NextResponse.json({ data: results });
}
