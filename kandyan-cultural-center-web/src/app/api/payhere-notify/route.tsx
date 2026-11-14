import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendWorkshopEmail, sendOrderEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
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
    
    const custom1 = formData.get('custom_1') as string;
    const isWorkshopBooking = custom1 && custom1.startsWith('booking:');
    const bookingId = isWorkshopBooking ? custom1.split(':')[1] : null;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const expectedLocalSignature = crypto
      .createHash('md5')
      .update(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret)
      .digest('hex').toUpperCase();

    const isEvalMode = process.env.NEXT_PUBLIC_EVAL_MODE === 'true';

    // allow eval mode to bypass signature check for testing purposes
    if (!isEvalMode && md5sig !== expectedLocalSignature) {
      console.error(`🚨 Signature Mismatch! PayHere sent: ${md5sig}, We expected: ${expectedLocalSignature}`);
      return NextResponse.json({ error: 'Signature mismatch.' }, { status: 400 });
    }

    if (statusCode === '2') { 
    
      // -------------FLOW A: WORKSHOP BOOKING------------------
      if (isWorkshopBooking && bookingId) {
        await supabase.from('workshop_bookings').update({ status: 'confirmed' }).eq('id', bookingId);
        await supabase.from('transactions').insert({ booking_id: bookingId, gateway_reference: paymentId, status: 'success', amount_paid: parseFloat(payhereAmount) });
        
        const { data: booking } = await supabase.from('workshop_bookings').select('*').eq('id', bookingId).single();

        if (booking) {
          await sendWorkshopEmail(
            booking.customer_email, 
            booking.customer_name, 
            booking.workshop_title, 
            booking.booked_date, 
            booking.booked_time, 
            booking.guests, 
            booking.id,
            parseFloat(payhereAmount)
          ).catch(console.error);
        }

      // --------------FLOW B: PHYSICAL SHOP ORDER------------------
      } else {
        const { data: rpcRes, error: rpcError } = await supabase.rpc('complete_shop_order_atomic', { p_order_id: orderId, p_payment_id: paymentId, p_amount: parseFloat(payhereAmount) });

        if (rpcError || !rpcRes?.success) return new Response('OK', { status: 200 }); 

        if (!rpcRes.already_processed) {
          const { data: orderData, error: fetchError } = await supabase
            .from('orders')
            .select(`
              *,
              profiles (
                email, 
                full_name
              ),
              order_items (
                quantity,
                selling_price_at_sale,
                artifact_variants (
                  color_name,
                  image_url,
                  artifacts ( name )
                )
              )
            `)
            .eq('id', orderId)
            .single();
          
          if (fetchError) console.error("Error fetching order for email:", fetchError);

          const customerEmail = Array.isArray(orderData?.profiles) 
            ? orderData?.profiles[0]?.email 
            : orderData?.profiles?.email;

          if (orderData && customerEmail) {
            await sendOrderEmail(
              customerEmail, 
              orderId, 
              orderData.shipping_address,
              parseFloat(payhereAmount),
              orderData.order_items || []
            ).catch(console.error);
          } else {
            console.error("Could not send email. Order data or email missing.", { orderData, customerEmail });
          }
        }
      }

    } else {
      if (isWorkshopBooking && bookingId) {
        await supabase.from('workshop_bookings').update({ status: 'failed' }).eq('id', bookingId);
      } else {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook Error Context:', error);
    return NextResponse.json({ error: 'Internal server failure monitoring webhooks.' }, { status: 500 });
  }
}