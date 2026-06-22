import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    // Add a safety check right at the start of the request
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Supabase credentials.' }, 
      { status: 500 }
    );
  }
  try {
    // PayHere sends system notification updates natively inside application/x-www-form-urlencoded formatting
    const formData = await request.formData();
    
    const merchantId = formData.get('merchant_id') as string;
    const orderId = formData.get('order_id') as string;
    const paymentId = formData.get('payment_id') as string;
    const payhereAmount = formData.get('payhere_amount') as string;
    const payhereCurrency = formData.get('payhere_currency') as string;
    const statusCode = formData.get('status_code') as string;
    const md5sig = formData.get('md5sig') as string;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;

    // 1. Re-verify the cryptographically unique incoming hash signature to validate message authenticity
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const expectedLocalSignature = crypto
      .createHash('md5')
      .update(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret)
      .digest('hex')
      .toUpperCase();

    if (md5sig !== expectedLocalSignature) {
      return NextResponse.json({ error: 'Security alert: Message signature manipulation detected.' }, { status: 400 });
    }

    // 2. Evaluate state outcomes provided securely via standard PayHere code signals
    if (statusCode === '2') { // '2' explicitly identifies absolute successful authorization execution
      // 1. Mark Order as Completed and Log Transaction (You already have this)
      await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);

      // 2. NEW: Fetch the items associated with this specific order
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', orderId);

      // 3. NEW: Loop through each purchased item and deduct it from the master stock table
      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          // Fetch current stock first
          const { data: currentArtifact } = await supabase
            .from('artifact_variants') // Change this to your exact table name ('artifacts' etc.)
            .select('stock')
            .eq('id', item.variant_id)
            .single();

          if (currentArtifact) {
            // Deduct the purchased quantity and update the database
            const newStock = currentArtifact.stock - item.quantity;
            
            await supabase
              .from('artifact_variants')
              .update({ stock: Math.max(0, newStock) }) // Math.max prevents negative stock
              .eq('id', item.variant_id);
          }
        }
      }
    } else {
      // Handle instances resulting from client platform execution errors/failures
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId);

      await supabase
        .from('transactions')
        .insert({
          order_id: orderId,
          gateway_reference: paymentId,
          status: `failed_code_${statusCode}`,
          amount_paid: parseFloat(payhereAmount)
        });
    }

    // Acknowledge validation receipt status confirmation directly back to the PayHere dispatch infrastructure servers
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook Error Context:', error);
    return NextResponse.json({ error: 'Internal system server failure monitoring webhooks.' }, { status: 500 });
  }
}