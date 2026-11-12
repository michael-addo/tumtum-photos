import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-client';
import { rateLimit } from '@/lib/rate-limit';
import { SHOOT_TYPES, BUDGETS, getPublicImageUrl } from '@/lib/gallery';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, scope: 'enquiries' });

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const check = limiter(req, ip);
  if (!check.ok) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Too many messages from this connection. Please try again in a few minutes.',
        retryAfter: check.retryAfter,
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'The request body was not valid JSON.' },
      { status: 400 },
    );
  }

  // Honeypot field
  if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
    const hp = (body as Record<string, unknown>).website;
    if (typeof hp === 'string' && hp.trim() !== '') {
      return NextResponse.json({
        ok: true,
        id: null,
        message: 'Thanks — we\'ll be in touch.',
      });
    }
  }

  // Validate required fields
  const resolvedBody = body as {
    name?: string;
    email?: string;
    phone?: string;
    shootType?: string;
    eventDate?: string;
    budget?: string;
    message?: string;
  };

  const name = typeof resolvedBody?.name === 'string' ? resolvedBody.name : '';
  const email = typeof resolvedBody?.email === 'string' ? resolvedBody.email : '';
  const phone = typeof resolvedBody?.phone === 'string' ? resolvedBody.phone : null;
  const shootType = typeof resolvedBody?.shootType === 'string' ? resolvedBody.shootType : '';
  const eventDate = typeof resolvedBody?.eventDate === 'string' ? resolvedBody.eventDate : null;
  const budget = typeof resolvedBody?.budget === 'string' ? resolvedBody.budget : null;
  const message = typeof resolvedBody?.message === 'string' ? resolvedBody.message : '';

  const errors: Record<string, string> = {};
  if (!name || name.length < 2) errors.name = 'Please tell us your name.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'That email address doesn\'t look right.';
  if (!SHOOT_TYPES.includes(shootType as any)) errors.shootType = 'Pick the kind of shoot you\'re interested in.';
  if (!message || message.length < 10) errors.message = 'Tell us a little more — at least 10 characters.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'invalid_enquiry', errors }, { status: 422 });
  }

  try {
    const client = createServerSupabase();

    const { data, error } = await client
      .from('enquiries')
      .insert({
        name,
        email,
        phone,
        shoot_type: shootType,
        event_date: eventDate,
        budget,
        message,
        ip_address: ip,
        honeypot: false,
      })
      .select('id')
      .single();

    if (error) throw error;

    console.log(`[enquiry] ${data.id} · ${shootType} · ${email}`);

    return NextResponse.json(
      {
        ok: true,
        id: data.id,
        message: 'Thanks — we\'ll reply within one working day.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Enquiry save error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Something went wrong on our end.' },
      { status: 500 },
    );
  }
}