import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Supabase credentials.' }, 
      { status: 500 }
    );
  }
  
  try {
    const formData = await request.formData();
    
    const merchantId = formData.get('merchant_id') as string;
    const orderId = formData.get('order_id') as string;
    const paymentId = formData.get('payment_id') as string;
    const payhereAmount = formData.get('payhere_amount') as string;
    const payhereCurrency = formData.get('payhere_currency') as string;
    const statusCode = formData.get('status_code') as string;
    const md5sig = formData.get('md5sig') as string;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;

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

    if (statusCode === '2') { 
      // 1. Mark the order as completed
      await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);

      // 2. 🚨 ADD THIS: Log the successful transaction so financial reports generate correctly
      await supabase
        .from('transactions')
        .insert({
          order_id: orderId,
          gateway_reference: paymentId,
          status: 'success',
          amount_paid: parseFloat(payhereAmount)
        });

      // 3. Deduct stock from inventory (Your existing code)
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', orderId);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          const { data: currentArtifact } = await supabase
            .from('artifact_variants') 
            .select('stock')
            .eq('id', item.variant_id)
            .single();

          if (currentArtifact) {
            const newStock = currentArtifact.stock - item.quantity;
            await supabase
              .from('artifact_variants')
              .update({ stock: Math.max(0, newStock) }) 
              .eq('id', item.variant_id);
          }
        }
      }
    } else {
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

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook Error Context:', error);
    return NextResponse.json({ error: 'Internal system server failure monitoring webhooks.' }, { status: 500 });
  }
}