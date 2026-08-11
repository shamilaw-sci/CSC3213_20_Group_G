import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json(); // 🚨 DO NOT read totalAmount from the browser

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    // 1. Authoritative Server-Side Price Calculation
    const { data: booking, error: fetchError } = await supabase
      .from('workshop_bookings')
      .select('guests, workshops(price)')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking || !booking.workshops) {
      return NextResponse.json({ error: 'Failed to verify booking pricing securely.' }, { status: 400 });
    }

    const basePrice = Number((booking.workshops as any).price);
    const guests = Number(booking.guests);
    
    const subtotal = basePrice * guests;
    const gatewayFee = Math.round(subtotal * 0.033);
    const authoritativeTotalAmount = subtotal + gatewayFee;

    // 2. Hash Generation
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const currency = 'LKR';
    const formattedAmount = authoritativeTotalAmount.toFixed(2);

    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const hashSignature = crypto
      .createHash('md5')
      .update(merchantId + bookingId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      merchantId,
      orderId: bookingId,
      amount: formattedAmount,
      currency,
      hash: hashSignature,
    });
  } catch (error) {
    console.error('Workshop Checkout Hash Error:', error);
    return NextResponse.json({ error: 'Internal Server Error generating payment hash.' }, { status: 500 });
  }
}