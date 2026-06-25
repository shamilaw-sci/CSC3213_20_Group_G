import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return NextResponse.json({ error: 'Missing workshop id' }, { status: 400 });
  }

  const { data: workshop, error } = await supabaseServer
    .from('workshops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!workshop) {
    return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
  }

  return NextResponse.json(workshop);
}
