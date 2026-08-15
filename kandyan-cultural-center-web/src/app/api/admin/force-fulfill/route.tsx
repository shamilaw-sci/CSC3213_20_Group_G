import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Secure Admin-Only Endpoint
export async function POST(req: Request) {
  try {
    // 🚨 FIXED: Changed request.json() to req.json()
    const { orderId, type, paymentReference } = await req.json();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 🚨 Verify the person requesting this is an actual ADMIN
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 1. Force Fulfill Workshop
    if (type === 'workshop') {
      await supabase.from('workshop_bookings').update({ status: 'confirmed' }).eq('id', orderId);
      await supabase.from('transactions').insert({
        booking_id: orderId,
        gateway_reference: paymentReference || 'MANUAL_ADMIN_RECOVERY',
        status: 'success',
        amount_paid: 0 // Recorded for auditing
      });
      return NextResponse.json({ success: true, message: 'Workshop manually confirmed.' });
    } 
    
    // 2. Force Fulfill Physical Order (using our atomic RPC to safely deduct stock)
    else if (type === 'order') {
      const { data: rpcRes, error: rpcError } = await supabase.rpc('complete_shop_order_atomic', {
        p_order_id: orderId,
        p_payment_id: paymentReference || 'MANUAL_ADMIN_RECOVERY',
        p_amount: 0
      });

      if (rpcError || !rpcRes?.success) {
        return NextResponse.json({ error: rpcError?.message || rpcRes?.error || 'Failed to deduct stock' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Order manually fulfilled and stock deducted.' });
    }

    return NextResponse.json({ error: 'Invalid type specified.' }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}